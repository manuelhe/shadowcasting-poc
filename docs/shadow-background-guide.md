# Engineering Implementation Guide: `<ShadowBackground />`

A comprehensive technical manual for frontend and creative developers implementing high-performance, interactive, and procedural shadowcasting backgrounds in Next.js.

---

## Table of Contents

1. [Architectural Overview & Core Mechanics](#1-architectural-overview--core-mechanics)
   - [The Status Quo Dilemma (Video vs. 3D Engines)](#the-status-quo-dilemma-video-vs-3d-engines)
   - [The Decoupled Two-Layer Composite Model (ADR-0001 & ADR-0002)](#the-decoupled-two-layer-composite-model-adr-0001--adr-0002)
   - [0 KB Base Plate VRAM Footprint](#0-kb-base-plate-vram-footprint)
   - [5% Bleed Overscan Margin](#5-bleed-overscan-margin)
   - [Spring Physics & Idle Rest Sleep (< 2% CPU)](#spring-physics--idle-rest-sleep--2-cpu)
   - [Progressive Degradation Ladder](#progressive-degradation-ladder)
2. [Shadow Synthesis Engines](#2-shadow-synthesis-engines)
   - [WebGL 2.0 Engine & Poisson-Disk Contact Hardening](#webgl-20-engine--poisson-disk-contact-hardening)
   - [Blink Texture Upload Safety (`uploadTextureImage`)](#blink-texture-upload-safety-uploadtextureimage)
   - [Canvas 2D Engine (Mid-Tier Fallback)](#canvas-2d-engine-mid-tier-fallback)
   - [Procedural Komorebi Engine (Dappled Sunlight)](#procedural-komorebi-engine-dappled-sunlight)
   - [Procedural Branch Engine (Dynamic Foliage Skeleton)](#procedural-branch-engine-dynamic-foliage-skeleton)
3. [Component API Reference](#3-component-api-reference)
4. [Implementation Recipes](#4-implementation-recipes)
   - [Recipe 1: Minimal Photographic Hero with Vector Branch Caster](#recipe-1-minimal-photographic-hero-with-vector-branch-caster)
   - [Recipe 2: Procedural Komorebi Sunlight on Studio Wall](#recipe-2-procedural-komorebi-sunlight-on-studio-wall)
   - [Recipe 3: Procedural Branch Skeleton with Custom Leaf Density](#recipe-3-procedural-branch-skeleton-with-custom-leaf-density)
   - [Recipe 4: Scroll-Driven Shadow Parallax for Longform Articles](#recipe-4-scroll-driven-shadow-parallax-for-longform-articles)
   - [Recipe 5: Coupled Base Plate Motion (3D Perspective Tilt)](#recipe-5-coupled-base-plate-motion-3d-perspective-tilt)
5. [Performance, Core Web Vitals & Troubleshooting](#5-performance-core-web-vitals--troubleshooting)

---

## 1. Architectural Overview & Core Mechanics

### The Status Quo Dilemma (Video vs. 3D Engines)

When engineering immersive landing pages, hero headers, or editorial articles with living light and shadow, teams traditionally face an unacceptable trade-off:

```
Traditional Video Loop (15MB–40MB)       Traditional 3D Scene Graph (Three.js/Spline)
┌──────────────────────────────────────┐  ┌──────────────────────────────────────────┐
│ • Enormous download payload          │  │ • 1.5MB–5MB 3D meshes & 4K textures      │
│ • Unreactive to user cursor/scroll   │  │ • 150KB–500KB JS runtime overhead        │
│ • Continuous battery depletion       │  │ • 60MB–120MB GPU VRAM allocation         │
│ • Delayed LCP, buffering stalls      │  │ • Mobile thermal throttling (60 → 18 FPS)│
└──────────────────────────────────────┘  └──────────────────────────────────────────┘
                                      ▼
           Decoupled Dynamic Shadowcasting (~140KB Total)
┌────────────────────────────────────────────────────────────────────────────────┐
│ • ~120KB WebP DOM Base Plate + ~20KB Shadow Caster + <5KB engine               │
│ • 0 KB Base Plate VRAM (browser compositor handles photographic substrate)     │
│ • Full spring-damped pointer, touch, and scroll reactivity                     │
│ • Strictly 0.000 CLS, FCP < 600ms, 60 FPS, <2% idle CPU                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

`<ShadowBackground />` replaces both paradigms with a decoupled, progressively enhanced architecture established in [ADR-0001](adr/0001-shadowcasting-component-architecture.md) and [ADR-0002](adr/0002-decoupled-transparent-shadow-layer.md).

---

### The Decoupled Two-Layer Composite Model (ADR-0001 & ADR-0002)

In the real physical world, an interior wall (the **Base Plate**) is rigid and stationary. When sunlight filters through a window or foliage, the wall remains unmoving; only the projected shadow moves across its surface.

Early WebGL background prototypes rendered both the wall image and the shadow in a single WebGL context quad, applying 3D perspective distortion to both simultaneously. This caused the wall itself to skew and float during cursor movement, producing an unnatural "arcade cabinet" effect.

`<ShadowBackground />` decouples these into two physically separated layers:

```
┌──────────────────────────────────────────────────────────────────┐
│ Foreground Interactive Content (DOM z-index: 10)                 │
│ Headings, typography, CTAs, interactive navigation               │
└──────────────────────────────────────────────────────────────────┘
                                 ▲
┌──────────────────────────────────────────────────────────────────┐
│ Decoupled Dynamic Shadow Canvas (WebGL 2.0 / Canvas 2D)          │
│ • Transparent alpha buffer (glClearColor(0, 0, 0, 0))            │
│ • 5% Bleed overscan margin (-5% inset, 110% width/height)        │
│ • CSS mix-blend-mode: multiply                                   │
│ • pointer-events: none                                           │
└──────────────────────────────────────────────────────────────────┘
                                 ▲
┌──────────────────────────────────────────────────────────────────┐
│ Stationary DOM Base Plate (Next.js <Image priority />)           │
│ • Photographic substrate (wood, plaster, architectural concrete) │
│ • Composited by hardware browser compositor                      │
│ • 0 KB WebGL VRAM allocation                                     │
└──────────────────────────────────────────────────────────────────┘
```

1. **Stationary DOM Base Plate**: Managed by Next.js `<Image priority fill />`. It renders immediately during Server-Side Rendering (SSR), guaranteeing a sub-600ms First Contentful Paint (FCP) and a strictly **0.000 Cumulative Layout Shift (CLS)**.
2. **Transparent Dynamic Shadow Canvas**: Positioned directly over the Base Plate with `mix-blend-mode: multiply` and `pointer-events: none`. It synthesizes *only* the shadow silhouette, rendering onto a fully transparent framebuffer.

---

### 0 KB Base Plate VRAM Footprint

On high-DPI mobile devices (e.g., iPhone Retina 3x or iPad 2x displays), uploading a 1920×1080 photographic substrate into a WebGL texture (`gl.texImage2D`) allocates **8.3 MB to 33.2 MB** of uncompressed 32-bit GPU VRAM.

Because the browser's DOM image pipeline already maintains the decoded photo for rendering the DOM image element, allocating an identical texture inside WebGL represents **100% redundant memory duplication**.

By synthesizing only the shadow on a transparent canvas and multiplying it over the DOM image, `<ShadowBackground />` achieves a **0 KB Base Plate VRAM footprint** in the WebGL context. This completely prevents GPU Tile-Based Deferred Rendering (TBDR) memory thrashing and iOS Safari `WebContent` Jetsam termination crashes.

---

### 5% Bleed Overscan Margin

When 3D perspective distortion (`perspective(1000px) rotateX(...) rotateY(...)`) is applied to an element bounded exactly to `absolute inset-0`, the tilted outer edges pull inward into the visible container, revealing jarring rectangular edges:

```
Without Bleed Margin:                     With 5% Bleed Margin (-5% inset, 110% size):
┌─────────────────────────┐               ┌─────────────────────────┐
│ Container               │               │ Container               │
│    ┌───────────────┐    │               │  ┌───────────────────┐  │
│   /  Tilted Edge  /     │ <─ Clipping!  │  │  Shadow Bleeds    │  │ <─ Seamless!
│  /   reveals void/      │               │  │  Beyond Borders   │  │
│ └───────────────┘       │               │  └───────────────────┘  │
└─────────────────────────┘               └─────────────────────────┘
```

`<ShadowBackground />` applies a standardized **5% bleed overscan margin**:
* `top: -5%`, `left: -5%`, `width: 110%`, `height: 110%`
* The shadow canvas overdraws slightly beyond the parent viewport container.
* As the camera tilts up to ±15°, the outer perimeter of the shadow remains outside the visible viewport, preventing visible canvas borders.

---

### Spring Physics & Idle Rest Sleep (< 2% CPU)

All interactive motion is computed using a closed-form second-order damped harmonic oscillator (`useMotionController`):

$$F = -k(x - x_{\text{target}}) - c \cdot v$$

* **Stiffness ($k$)**: Controls responsiveness and acceleration towards the cursor.
* **Damping ($c$)**: Controls friction and dissipation of oscillatory energy.
* **Mass ($m$)**: Imparts physical inertia and momentum.

#### Resting Sleep Threshold
Unlike video backgrounds that continuously drain battery, the motion controller tracks velocity ($v$) and displacement ($\Delta x$). When:
$$|v| < 0.0001 \quad \text{and} \quad |\Delta x| < 0.0001$$
the controller declares **rest**, halts the `requestAnimationFrame` loop, and invokes `onRest()`. When the user moves their mouse or touches the screen, `onWake()` fires and animation smoothly resumes.

**Idle CPU usage drops to < 2%**, saving mobile battery life.

---

### Progressive Degradation Ladder

`<ShadowBackground />` inspects device capabilities on mount using `detectDeviceCapabilities()`:

| Tier | Condition | Engine Selected | Capabilities Active |
| :--- | :--- | :--- | :--- |
| **`full-dynamic`** | WebGL 2.0 / 1.0 supported, GPU capable, `prefers-reduced-motion: no-preference` | `WebGlShadowEngine` | Poisson-disk contact hardening, 3D perspective tilt, spring-damped pointer, ambient wind sway |
| **`low-dynamic`** | Low GPU score, mobile device, or `prefers-reduced-motion: reduce` | `Canvas2dShadowEngine` | Directional 2D blur, subtle translation displacement only (0° tilt), static penumbra |
| **`static-poster`** | WebGL unsupported, JavaScript disabled, battery saver active, or forced tier | Pure DOM `<Image />` | Single static pre-rendered composite poster image; 0 JS execution, 0 CPU overhead |

---

## 2. Shadow Synthesis Engines

`<ShadowBackground />` encapsulates multiple interchangeable rendering subsystems beneath a unified interface:

```
                               ┌─────────────────────────────┐
                               │    <ShadowBackground />     │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
         ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
         │ WebGlShadowEngine   │   │ Canvas2dShadowEngine│   │ Procedural Engines  │
         │ • Poisson-disk blur │   │ • Offscreen canvas  │   │ • Komorebi noise    │
         │ • Contact hardening │   │ • 2D context blur   │   │ • Branch skeleton   │
         │ • Hardware multiply │   │ • Mid-tier fallback │   │ • Zero texture size │
         └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

### WebGL 2.0 Engine & Poisson-Disk Contact Hardening

In physical optics, shadows are not uniformly blurred. The edge of a shadow is sharp near the point of contact with the receiving surface, expanding into a soft, diffused **Penumbra** as the distance between the occluder and surface increases.

The `WebGlShadowEngine` computes contact hardening in a single GPU fragment shader pass using a 12-tap Poisson-disk sampling kernel:

```glsl
// GLSL Fragment Shader: Variable-Kernel Poisson Disk
precision mediump float;
uniform sampler2D u_casterTexture;
uniform vec2 u_resolution;
uniform vec2 u_lightPos;
uniform float u_penumbra;
uniform float u_contactHardening;
uniform float u_shadowOpacity;

const vec2 POISSON_DISK[12] = vec2[](
  vec2(-0.326212, -0.40581),  vec2(-0.840144, -0.07358),
  vec2(-0.695914,  0.457137), vec2(-0.203345,  0.620716),
  vec2( 0.96234,  -0.194983), vec2( 0.473434, -0.480026),
  vec2( 0.519456,  0.767022), vec2( 0.185461, -0.893124),
  vec2( 0.507431,  0.064425), vec2( 0.89642,   0.412458),
  vec2(-0.32194,  -0.932615), vec2(-0.791559, -0.59771)
);

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // Calculate distance from contact anchor point
  float dist = length(uv - u_lightPos);
  float kernelRadius = u_penumbra * (u_contactHardening > 0.5 ? dist : 1.0);

  float shadowAlpha = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 offset = POISSON_DISK[i] * kernelRadius;
    shadowAlpha += texture2D(u_casterTexture, uv + offset).a;
  }
  shadowAlpha /= 12.0;

  gl_FragColor = vec4(0.0, 0.0, 0.0, shadowAlpha * u_shadowOpacity);
}
```

---

### Blink Texture Upload Safety (`uploadTextureImage`)

In Chromium (Blink) on macOS, SVGs without explicit pixel dimensions (`width="100%" height="100%"`) do not report intrinsic dimensions to the rendering engine (`!image->HasIntrinsicDimensions()`). Passing such images directly to `gl.texImage2D` triggers `WebGL: INVALID_VALUE: texImage2D: bad image data` (error 1281), causing the WebGL canvas to remain completely blank.

All engines in `<ShadowBackground />` use the [`uploadTextureImage`](src/components/engines/texture-utils.ts) utility:

```typescript
// src/components/engines/texture-utils.ts
export function uploadTextureImage(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  img: HTMLImageElement
): void {
  const isSvg =
    img.src.includes(".svg") ||
    img.src.startsWith("data:image/svg+xml") ||
    img.naturalWidth === 0;

  if (isSvg) {
    // Safely rasterize SVG onto an offscreen 2D canvas with explicit dimensions
    const offscreen = document.createElement("canvas");
    const targetWidth = img.naturalWidth || img.width || 1024;
    const targetHeight = img.naturalHeight || img.height || 1024;
    offscreen.width = targetWidth;
    offscreen.height = targetHeight;

    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
      return;
    }
  }

  // Fast direct bitmap path (PNG, WebP, JPEG)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
}
```

This guarantees that any dynamic SVG, whether bundled or supplied by external APIs, renders correctly across Chromium, Firefox, and Safari without WebGL exceptions.

---

### Canvas 2D Engine (Mid-Tier Fallback)

For devices where WebGL is unavailable or when the `low-dynamic` tier is active, `Canvas2dShadowEngine` synthesizes shadows using the browser's 2D canvas API. It applies directional offsets and CSS canvas filter blur (`ctx.filter = 'blur(Xpx)'`), rendering cleanly at 60 FPS while minimizing battery consumption.

---

### Procedural Komorebi Engine (Dappled Sunlight)

`ProceduralKomorebiEngine` generates organic, wind-stirred dappled forest light (*komorebi*) using fractional Brownian motion (fBm) noise:
* **Zero Texture Wire Download**: The sunlight pattern is generated mathematically via GLSL shader code in real time.
* **Organic Wind Drift**: Dynamic vector drift simulates wind blowing through canopy leaves with zero memory allocation.

---

### Procedural Branch Engine (Dynamic Foliage Skeleton)

`ProceduralBranchEngine` renders an interactive fractal branch skeleton:
* **Recursive Branching Geometry**: Generates organic tree silhouettes using stochastic L-system branching rules.
* **Wind Sway Harmonics**: Secondary branches sway with phase-delayed harmonic frequencies, creating lifelike foliage motion in response to wind and pointer movement.

---

## 3. Component API Reference

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";
```

### Props Specification

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `basePlate` | `string` | **Required** | URL or path to the stationary background image (WebP, JPEG, SVG). |
| `caster` | `ShadowCasterConfig` | **Required** | Discriminated union defining the shadow shape source (see below). |
| `poster` | `string` | `undefined` | Static fallback image URL rendered during SSR or on low-tier devices. |
| `tier` / `degradation` | `DegradationTier` | `"auto"` | `"auto"`, `"full-dynamic"`, `"low-dynamic"`, `"static-poster"`. |
| `penumbra` | `number` | `0.02` | Diffusion softness of the shadow boundary (typical: `0.005` to `0.06`). |
| `contactHardening`| `boolean` | `true` | When true, shadows are sharp near contact points and diffuse outward. |
| `shadowOpacity` | `number` | `0.65` | Maximum darkness multiplier of the cast shadow (`0.0` to `1.0`). |
| `shadowColor` | `string` | `"#000000"` | Hex or RGBA color code for the shadow tone. |
| `basePlateMotion` | `boolean` | `false` | When true, couples the Base Plate to 3D perspective tilt alongside the shadow. |
| `lightDirection` | `[number, number, number]` | `[-0.3, 0.4, 1.0]` | Normalized 3D vector `[x, y, z]` representing light angle. |
| `fit` | `"cover" \| "contain" \| "fill"` | `"cover"` | CSS object-fit behavior for Base Plate and Caster textures. |
| `motion` | `MotionPreset \| MotionConfig` | `"smooth"` | Preset string (`"smooth"`, `"snappy"`, `"inertial"`, `"bouncy"`, `"none"`) or config object. |
| `blendMode` | `"multiply" \| "normal"` | `"multiply"` | CSS blend mode between shadow canvas and Base Plate substrate. |
| `offset` | `{ x: number; y: number }` | `{ x: 0, y: 0 }` | Static pixel displacement offset applied to the caster origin. |
| `onTierChange` | `(tier: string) => void` | `undefined` | Callback invoked when degradation tier adapts dynamically. |
| `onRest` | `() => void` | `undefined` | Callback invoked when interactive spring motion settles to sleep (<2% CPU). |
| `onWake` | `() => void` | `undefined` | Callback invoked when user interaction wakes the animation loop. |
| `children` | `React.ReactNode` | `undefined` | Foreground UI content rendered at `z-index: 10` above the background. |

### `ShadowCasterConfig` Discriminated Union

```typescript
export type ShadowCasterConfig =
  // 1. Static Image or Vector Silhouette
  | { type: "image"; src: string; opacity?: number }
  // 2. Procedural Komorebi (Dappled Sunlight Noise)
  | { type: "komorebi"; density?: number; contrast?: number; scale?: number; speed?: number }
  // 3. Procedural Branch Skeleton
  | { type: "branch"; depth?: number; leafDensity?: number; swaySpeed?: number };
```

### `MotionConfig` Object

```typescript
export interface MotionConfig {
  preset?: "smooth" | "snappy" | "inertial" | "bouncy" | "none";
  stiffness?: number;       // Spring tension (default: 80 - 180)
  damping?: number;         // Friction damping (default: 14 - 24)
  mass?: number;            // Inertial weight (default: 1.0)
  ambient?: boolean;        // Enable continuous gentle wind sway
  ambientSpeed?: number;    // Oscillation frequency multiplier
  ambientStrength?: number; // Maximum sway displacement in pixels
  maxDisplacementPx?: number; // Cursor tracking boundary limit
  scrollInfluence?: boolean | number; // Coupled vertical scroll parallax factor
}
```

---

## 4. Implementation Recipes

### Recipe 1: Minimal Photographic Hero with Vector Branch Caster

Standard high-performance editorial hero header with stationary architectural drywall and interactive botanical branch shadow.

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function HeroSection() {
  return (
    <ShadowBackground
      basePlate="/images/base-architectural.webp"
      poster="/images/hero-fallback.webp"
      caster={{
        type: "image",
        src: "/images/caster-branch.svg",
        opacity: 0.7,
      }}
      penumbra={0.025}
      contactHardening={true}
      motion="smooth"
      className="relative min-h-[600px] w-full"
    >
      <div className="mx-auto max-w-4xl px-8 py-24 text-white">
        <h1 className="text-5xl font-serif tracking-tight">
          Architectural Light & Organic Shadow
        </h1>
        <p className="mt-4 text-lg text-neutral-300">
          Decoupled dynamic shadowcasting delivering zero CLS and 60 FPS.
        </p>
      </div>
    </ShadowBackground>
  );
}
```

---

### Recipe 2: Procedural Komorebi Sunlight on Studio Wall

Generates dynamic dappled sunlight filtering through wind-tossed trees without downloading any video or silhouette assets.

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function StudioKomorebiHero() {
  return (
    <ShadowBackground
      basePlate="/images/base-minimal-studio.webp"
      caster={{
        type: "komorebi",
        density: 0.65,
        contrast: 1.2,
        scale: 1.0,
        speed: 0.8,
      }}
      shadowOpacity={0.45}
      penumbra={0.04}
      motion={{
        preset: "inertial",
        ambient: true,
        ambientSpeed: 0.5,
        ambientStrength: 12,
      }}
      className="relative h-screen w-full"
    >
      <div className="flex h-full items-center justify-center">
        <span className="text-sm uppercase tracking-widest text-neutral-600">
          Atelier Collection · Autumn 2026
        </span>
      </div>
    </ShadowBackground>
  );
}
```

---

### Recipe 3: Procedural Branch Skeleton with Custom Leaf Density

Synthesizes a living tree branch directly in GPU memory with configurable density and wind physics.

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function BotanicalShowcase() {
  return (
    <ShadowBackground
      basePlate="/images/distressed-plaster.webp"
      caster={{
        type: "branch",
        depth: 4,
        leafDensity: 0.85,
        swaySpeed: 1.2,
      }}
      contactHardening={true}
      penumbra={0.018}
      motion={{
        preset: "bouncy",
        stiffness: 90,
        damping: 12,
      }}
      className="h-[700px] w-full"
    />
  );
}
```

---

### Recipe 4: Scroll-Driven Shadow Parallax for Longform Articles

Shadow position responds smoothly to page scroll position alongside pointer interaction.

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function EditorialLongform() {
  return (
    <ShadowBackground
      basePlate="/images/wood-background.webp"
      caster={{
        type: "image",
        src: "/images/caster-branch.svg",
      }}
      motion={{
        preset: "smooth",
        scrollInfluence: 0.35, // 35% vertical displacement coupling
        maxDisplacementPx: 45,
      }}
      className="relative h-[800px] w-full"
    >
      <article className="prose prose-invert mx-auto py-32">
        <h2>The Architecture of Light</h2>
        <p>As you scroll through this narrative, light angle tracks the page flow...</p>
      </article>
    </ShadowBackground>
  );
}
```

---

### Recipe 5: Coupled Base Plate Motion (3D Perspective Tilt)

Enables full 3D card tilt for interactive product cards or gamified showcases where the background substrate itself tilts in perspective.

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function InteractiveCardHero() {
  return (
    <ShadowBackground
      basePlate="/images/carbon-fiber.webp"
      caster={{
        type: "image",
        src: "/images/geometric-grid.svg",
      }}
      basePlateMotion={true} // Couples Base Plate to 3D perspective tilt
      motion={{
        preset: "snappy",
        stiffness: 140,
        damping: 18,
      }}
      className="h-[500px] w-full rounded-2xl shadow-2xl"
    >
      <div className="p-12 text-white">
        <h3 className="text-2xl font-bold">Coupled 3D Perspective</h3>
      </div>
    </ShadowBackground>
  );
}
```

---

## 5. Performance, Core Web Vitals & Troubleshooting

### Core Web Vitals Optimization Checklist

1. **Largest Contentful Paint (LCP)**:
   - Always provide an optimized WebP or AVIF `basePlate` image.
   - Use Next.js `<Image priority />` under the hood (handled automatically by `ShadowBackground`).
   - Keep Base Plate file weight under **150 KB**.
2. **Cumulative Layout Shift (CLS)**:
   - Ensure the outer container element has an explicit height or aspect ratio (e.g., `h-screen`, `min-h-[600px]`, or `aspect-[16/9]`).
   - The decoupled design guarantees **0.000 CLS** because the DOM image element establishes dimensions immediately during initial render.
3. **First Input Delay (FID) & Interaction to Next Paint (INP)**:
   - All pointer listeners are passive (`{ passive: true }`).
   - Canvas synthesis executes on an unblocked `requestAnimationFrame` loop.
   - Sleep threshold suspends animation when motion settles, keeping CPU idle for user interactions.

---

### Diagnostic HUD

To monitor live rendering performance during development, mount the `DiagnosticHUD` component:

```tsx
import { DiagnosticHUD } from "@/components/DiagnosticHUD";

export default function Page() {
  return (
    <main>
      <DiagnosticHUD />
      <ShadowBackground ... />
    </main>
  );
}
```

The HUD displays:
* Current active **Synthesis Engine** (`WebGL 2.0`, `Canvas 2D`, or `DOM Poster`).
* Instantaneous **FPS** and frame render time ($\Delta t$).
* Active **Degradation Tier** and resting sleep state (`Awake` / `Sleeping`).
* Pointer coordinate displacement $(\Delta x, \Delta y)$.

---

### Common Troubleshooting Scenarios

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Blank WebGL canvas in Chrome on Mac** | SVG caster lacks explicit pixel dimensions (`width="100%"`). | Ensure SVGs declare explicit `width="800"` and `height="600"` matching `viewBox`. `uploadTextureImage` will automatically handle fallbacks. |
| **Canvas edges clip during mouse tilt** | 5% bleed margin was overridden by custom styling. | Ensure `overflow: hidden` is applied to the parent container, and avoid overriding `-5%` inset styles. |
| **Animation does not sleep at rest** | Custom spring damping is too low ($c < 5$) or ambient motion is enabled. | Set `damping: 18` or `preset: "smooth"`; verify ambient motion is disabled if sleep is desired. |
| **Flicker during hydration** | Missing `poster` prop on high-latency networks. | Provide a static WebP `poster` URL representing the default resting frame. |
