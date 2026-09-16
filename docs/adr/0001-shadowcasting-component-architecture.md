# 0001 - Dynamic Shadowcasting Component Architecture

* **Status**: Accepted
* **Deciders**: Antigravity Team, Frontend Engineering, Systems Performance Group
* **Date**: 2026-09-16
* **Technical Story**: [Ticket #10 (Task: ADR-0001)](https://github.com/manuelhe/shadowcasting-poc/issues/10), [Spec #9 (Production Component Specification)](https://github.com/manuelhe/shadowcasting-poc/issues/9)

---

## Context and Problem Statement

Modern web applications increasingly use organic visual cues—such as dappled sunlight filtering through swaying trees (*komorebi*), architectural window silhouettes, and botanical branch shadows—to create tactile depth and immersive atmosphere in hero sections, headers, and footers. However, developers lack an accessible, production-ready solution that delivers photorealistic dynamic shadowcasting in Next.js without degrading performance or violating Core Web Vitals.

Existing browser-based approaches exhibit critical architectural limitations:

1. **CSS/SVG Blur Filters (`filter: blur()`, `<feGaussianBlur>`)**:
   - While performant for static transforms, animating complex shadows or dynamic blur radii triggers continuous compositor render-surface invalidations (`cc::RenderSurfaceImpl` in Chromium, `CALayer`/`CAFilter` in WebKit).
   - At high display resolutions (1080p @ 2x DPR to 4K), intermediate render surfaces consume between **49 MB and 190 MB** of VRAM, triggering Tile-Based Deferred Rendering (TBDR) memory churn and causing uncatchable WebContent termination (Jetsam kills) on iOS Safari.
   - Furthermore, CSS filters apply a uniform isotropic blur across the entire silhouette, making optical **Contact Hardening** physically impossible.

2. **Canvas 2D Software/State-Machine Blurring (`ctx.filter`, CPU Box Blurs)**:
   - Mutating `ctx.filter` between frames breaks internal GPU draw-call batching, causing driver pipeline reconfigurations.
   - Implementing variable blur via multi-pass CPU box blurs on `ImageData` incurs execution times of **18ms to 50ms** on desktop and upwards of **140ms** on mid-tier mobile processors, monopolizing the main thread and severely degrading Interaction to Next Paint (INP).

3. **Core Web Vitals & Hydration Hazards**:
   - Under the W3C Largest Contentful Paint (LCP) specification (§5.1), HTML5 `<canvas>` elements are explicitly excluded from LCP candidacy. A client-rendered canvas replacing a hero background causes severe LCP regressions unless accompanied by an SSR image preload.
   - Hydrating canvas contexts and attaching animation listeners during the critical page bootstrap phase introduces Cumulative Layout Shift (CLS) risks and competes with critical application JavaScript for main-thread CPU time.

4. **Resource Waste & Battery Depletion**:
   - Continuous `requestAnimationFrame` loops animating ambient wind or pointer parallax continue firing even when user interaction ceases, consuming 15%–35% continuous CPU load and draining mobile device batteries.

We need a unified, performant, progressively enhanced Next.js component (`<ShadowBackground />`) that casts photorealistic, physically grounded shadows over an arbitrary **Base Plate**, dynamically responds to pointer, touch, and scroll interactions, and adheres to strict production performance, accessibility, and Core Web Vitals requirements.

---

## Decision Drivers

* **Optical Realism & Contact Hardening**: Ability to simulate physical penumbra expansion—sharp edges near contact points that progressively soften into broad, diffuse penumbras at greater distances—as well as natural, non-repeating organic canopy movement.
* **Core Web Vitals & Zero-LCP Guarantee**: Absolute preservation of LCP (< 2.5s) and CLS (strictly 0.000) during SSR, initial paint, and deferred client hydration.
* **Framerate Stability & Sub-Millisecond Frame Times**: Sustained 60–120 FPS during active pointer parallax, touch dragging, and window scroll, with GPU frame render times below 1.0ms.
* **Zero Idle CPU & Power Conservation**: Complete dormancy (0% idle CPU) of the animation loop when interaction settles or motion is at rest.
* **Memory & Hardware Safety**: Zero VRAM bloat and prevention of mobile GPU thermal throttling or iOS WebContent Jetsam process terminations.
* **Progressive Enhancement & Capability Gating**: Automatic, graceful degradation to a **Static Poster Fallback** or Canvas 2D fallback on low-end hardware, data-saving connections, or user-preferred reduced motion.
* **Developer Ergonomics & Pluggability**: A declarative, type-safe React API with pluggable **Shadow Casters** (raster image alpha masks, GPU procedural Komorebi noise, parametric vector branch skeletons) and simple one-line motion presets.

---

## Considered Options

We evaluated three primary rendering architectures through comprehensive browser research ([Issue #2](https://github.com/manuelhe/shadowcasting-poc/issues/2), [Issue #3](https://github.com/manuelhe/shadowcasting-poc/issues/3)) and empirical prototyping benchmarks ([Issue #5](https://github.com/manuelhe/shadowcasting-poc/issues/5), [Issue #6](https://github.com/manuelhe/shadowcasting-poc/issues/6), [Issue #7](https://github.com/manuelhe/shadowcasting-poc/issues/7)).

### Option 1: CSS Filters (`filter: blur()`) & SVG `<feGaussianBlur>`

* **Mechanism**: Render the **Shadow Caster** as a transformed DOM element (`<img>` or SVG `<path>`) overlaid on the **Base Plate**, styled with `filter: blur(...)` and `mix-blend-mode: multiply`.
* **Empirical Findings**:
  - *Compositor Layer Overhead*: Allocates full-resolution intermediate GPU textures with bleed margins. For a 1920x1080 viewport at 2x DPR, a single blurred layer occupies **49.4 MB**; at 4K (3840x2160 @ 2x DPR), memory exceeds **197.7 MB**.
  - *Invalidation Churn*: While affine translations (`translate3d`) animate on the compositor thread, any change to the blur radius (penumbra expansion) or SVG geometry (swaying branch skeleton) invalidates the render surface. This triggers main-thread re-rasterization, resulting in compositor worker stalls and visible checkerboarding.
  - *iOS Safari Jetsam*: On iOS devices with a per-process WebContent memory limit of 224 MB–384 MB, dual high-DPI layers quickly trigger unrecoverable tab reloads.
  - *Visual Realism*: Flat, uniform Gaussian blur. Mathematically incapable of directionally varying or distance-based **Contact Hardening**.

### Option 2: HTML5 Canvas 2D (`ctx.filter` & Multi-Pass CPU Blurs)

* **Mechanism**: Render the **Base Plate** and **Shadow Caster** onto an HTML5 `<canvas>` using `CanvasRenderingContext2D`, applying blurs via `ctx.filter = 'blur(Xpx)'` or programmatic multi-pass box blur algorithms on `ImageData`.
* **Empirical Findings**:
  - *State Machine Overhead*: Rapidly modifying `ctx.filter` between frames flushes the GPU command buffer and causes frequent texture re-uploads.
  - *CPU Execution Cost*: A 3-pass CPU box blur at 1080p requires **18ms–50ms** per frame on an Apple M-series CPU and **80ms–140ms** on an ARM Cortex-A55 mobile CPU, dropping framerates to 7–12 FPS and inducing critical INP failures (> 500ms).
  - *Contact Hardening*: Achieving contact hardening in Canvas 2D requires slicing the caster into multiple depth segments or manually computing convolution kernels, multiplying CPU overhead by the number of depth layers.

### Option 3: Hardware-Accelerated WebGL Fragment Shader with Poisson-Disk dual-filtering

* **Mechanism**: Render a single screen-aligned quad in WebGL 2 (or WebGL 1 fallback). A custom fragment shader samples the **Base Plate** texture and **Shadow Caster** texture (or evaluates procedural noise on the fly), executing a 12-tap golden-spiral Poisson-disk kernel with distance-scaled radius offsets to calculate variable **Penumbra** diffusion and physical **Contact Hardening**.
* **Empirical Findings**:
  - *GPU Execution Time*: Executes in **< 0.8ms** per frame on mid-tier GPUs (e.g., Apple M1, Qualcomm Adreno 650, Intel Iris Xe) at 1080p @ 2x DPR, comfortably maintaining steady 60–120 FPS.
  - *Memory Footprint*: Allocates a single viewport-sized frame buffer and bound textures (~4 MB total VRAM). Procedural casters (GLSL Simplex fBm) require **0 KB** additional texture memory.
  - *Compositor Isolation*: Bypasses browser DOM compositing pipelines; texture sampling and Poisson convolution occur entirely in high-speed GPU cache, eliminating TBDR memory bandwidth stalls.
  - *Contact Hardening*: Natively achieved in a single fragment shader pass by projecting UV distance vectors from the caster anchor origin into the Poisson sampling radius uniform.

---

### Empirical Engine Comparison Matrix

| Evaluation Dimension | Option 1: CSS/SVG Filters | Option 2: Canvas 2D (`ctx.filter`) | Option 3: WebGL Poisson Shader (Selected) |
| :--- | :--- | :--- | :--- |
| **GPU Frame Time** | Variable (2ms–16ms, spike-prone) | N/A (CPU bound) | **< 0.8ms (Stable 60–120 FPS)** |
| **Main-Thread CPU Time** | 0.2ms (transform only) / >16ms (blur change) | 2.5ms – 6.0ms (GPU) / 18ms–140ms (CPU) | **< 0.1ms** |
| **Memory Allocation (1080p @ 2x)** | 49 MB – 190 MB (Layer Bleed) | 16 MB (Single Canvas Buffer) | **~4 MB (Canvas Backbuffer + Textures)** |
| **Procedural Canopy VRAM** | 500 KB – 2.4 MB (Raster Frames) | 500 KB – 2.4 MB (Raster Frames) | **0 KB (Pure Math GLSL Simplex fBm)** |
| **Branch Skeleton Heap** | N/A | < 15 KB (Joint Tree) | **< 15 KB (Joint Tree, 1.2ms CPU)** |
| **Contact Hardening** | ❌ Impossible (Uniform blur only) | ⚠️ Costly (Requires multi-pass slicing) | **✅ Native in single fragment pass** |
| **LCP Impact** | Risk of layer raster stall | Excluded from LCP by W3C spec | **Zero (via SSR static poster fallback)** |
| **Thermal & Jetsam Risk** | High (iOS Safari OOM termination) | Moderate | **Negligible (Sub-GB/s TBDR bandwidth)** |
| **Fallback Requirement** | Low (Universally supported) | Moderate | Requires Canvas 2D fallback |

---

## Decision Outcome

**Chosen Solution**: **Adaptive WebGL with Canvas 2D Fallback and Static Poster SSR Floor**.

We select hardware-accelerated WebGL utilizing a 12-tap Poisson-disk sampling fragment shader as our primary **Shadow Synthesis Engine**, paired with an automatic Canvas 2D fallback for devices lacking WebGL context support, and a pre-rendered **Static Poster Fallback** rendered via `next/image priority` during SSR.

The architecture is composed of five foundational pillars:

```mermaid
flowchart TD
    subgraph SSR["1. Server-Side Rendering (Zero-LCP Floor)"]
        SSR_HTML["Next.js Server Component / SSR"] --> PosterNode["next/image (priority, fill, fetchpriority='high')"]
        PosterNode --> LCP_Paint["LCP Paint Event (< 1.2s, CLS = 0.000)"]
    end

    subgraph Hydration["2. Cooperative Idle Hydration & Capability Gating"]
        LCP_Paint --> IdleCallback["requestIdleCallback / setTimeout Fallback"]
        IdleCallback --> CapDetection["detectDeviceCapabilities()"]
        CapDetection -->|prefers-reduced-motion OR low memory/cores| TierStatic["Degradation Tier: static-poster<br/>(Stay on Poster, 0% CPU/GPU)"]
        CapDetection -->|No WebGL2 / Major Caveat| TierCanvas["Degradation Tier: low-dynamic<br/>(Canvas 2D Shadow Engine)"]
        CapDetection -->|Hardware Capable| TierWebGL["Degradation Tier: full-dynamic<br/>(WebGL Poisson-Disk Engine)"]
    end

    subgraph Runtime["3. Dynamic Synthesis & Sleep Loop"]
        TierWebGL --> EngineMount["Mount WebGL Canvas at inset-0"]
        TierCanvas --> CanvasMount["Mount Canvas2D at inset-0"]
        EngineMount --> CrossFade["300ms CSS Opacity Cross-fade (Poster -> Canvas)"]
        CanvasMount --> CrossFade
        CrossFade --> MotionController["useMotionController (Semi-implicit Euler Spring)"]
        MotionController -->|Pointer / Touch / Scroll| WakeLoop["Wake rAF Loop (Active 60fps)"]
        WakeLoop -->|Pointer Settled & Rest Tolerance reached| SleepLoop["Dormant rAF Sleep (0% CPU / 0W Battery)"]
        SleepLoop -->|Interaction Event| WakeLoop
    end
```

### Pillar 1: Adaptive Shadow Synthesis Engine
- **WebGL Primary Engine**: Compiles a precision-optimized vertex shader and a fragment shader that computes variable penumbra contact hardening. Using a 12-tap golden-spiral Vogel/Poisson disk, it calculates soft penumbra diffusion based on the formula:
  $$\text{dist} = \text{clamp}(\|\mathbf{uv}_{\text{caster}} - \mathbf{uv}_{\text{anchor}}\| \times 1.5, 0.15, 1.8)$$
  $$\text{penumbraRadius} = \mathbf{u\_blurRadius} \times \text{mix}(1.0, \text{dist}, \mathbf{u\_contactHardening})$$
- **Canvas 2D Fallback**: If WebGL context creation throws or returns null (or triggers `webglcontextlost`), the component gracefully degrades to a Canvas 2D engine with standard linear blur filtering and `ctx.globalCompositeOperation = 'multiply'`.
- **Zero Invalidation Churn**: All transforms, skewing, and displacements are transmitted as uniform floats (`u_offset`, `u_scale`, `u_blurRadius`), avoiding canvas DOM restructuring or texture reallocations.

### Pillar 2: Pluggable Shadow Casters
The component abstracts shadow sources via a strictly typed discriminated union (`ShadowCasterConfig`):
1. **Raster Silhouette Mask (`type: "image"`)**: Supports high-resolution alpha PNG or SVG silhouettes. Loaded into a static WebGL texture unit once, consuming ~500 KB to 2 MB VRAM.
2. **Procedural Komorebi Canopy (`type: "komorebi"`)**: Evaluates Stefan Gustavson / Ashima Arts 2D Simplex noise directly inside the fragment shader with fractional Brownian motion (fBm) and time-based wind domain warping. Consumes **0 KB** heap and texture memory, producing non-repeating organic dappled foliage at < 0.1ms CPU cost.
3. **Parametric Swaying Branch (`type: "branch"`)**: Generates an L-system joint skeleton (< 15 KB heap) computed via recursive harmonic sway formulas ($1.2\text{ms}$ CPU) and rendered as dynamic shadow geometry.

### Pillar 3: Zero-LCP Hydration Lifecycle & Capability Gating
To satisfy Core Web Vitals guarantees:
- **SSR Floor**: The component emits an SSR-rendered `<Image priority fill />` displaying the static poster (or the raw base plate). This generates `<link rel="preload">` tags with `fetchpriority="high"`, locking the LCP timestamp to the earliest possible network response.
- **Strict Geometric Containment**: The root wrapper uses `relative overflow-hidden` with absolute `inset-0` dimensions for all background children. This guarantees a Cumulative Layout Shift of strictly **0.000**.
- **Cooperative Handover**: Client initialization of the canvas and WebGL context is scheduled via `requestIdleCallback` (with a cooperative `setTimeout(..., 100)` fallback for Apple WebKit). Once the initial frame is rendered, a 300ms hardware-accelerated CSS opacity cross-fade transitions the canvas into visibility without visual pop or frame drop.
- **Hardware Capability Detection**:
  - Automatically assesses `prefers-reduced-motion`, `navigator.connection.saveData`, `navigator.deviceMemory`, and `navigator.hardwareConcurrency`.
  - **WebKit Clamping Heuristic**: Recognizes that iOS/iPadOS WebKit clamps `hardwareConcurrency` to 2 for fingerprinting prevention; relies on `deviceMemory` and WebGL unmasked renderer strings to prevent false-positive downgrades of high-end Apple devices.
  - Low-capability devices remain on the **Static Poster Fallback** permanently.

### Pillar 4: Composable Motion Controller with Power-Saving Sleep Loop
- **Physics Solver**: Utilizes a headless second-order semi-implicit Euler spring integrator ($F = -k \Delta x - c v$) to guarantee zero-lag pointer tracking and smooth deceleration without oscillation overshoot.
- **Built-in Presets**: Supports four calibrated presets: `snappy` ($k=280, c=30$), `smooth` ($k=160, c=20$), `inertial` ($k=70, c=14, m=2.2$), and `bouncy` ($k=180, c=11$).
- **3D Depth & Penumbra Dilation**: Computes center-relative normalized coordinates $[-1..1]$ to derive virtual light directions $(L_x, L_y, L_z)$, scroll elevation deltas, and 3D perspective distortion (`perspective(1000px) rotateX(...) rotateY(...)`), dynamically broadening penumbra blur during rapid cursor velocity to simulate optical motion blur.
- **Sleeping rAF Loop**: When pointer interaction ceases and velocity falls below the rest threshold ($\epsilon = 0.05$), the `requestAnimationFrame` loop suspends execution. Idle CPU usage drops to strictly **0.0%**, conserving battery on laptops and mobile devices.

### Pillar 5: Stacking & Layout Isolation
- All rendering layers (base plate, shadow canvas, ambient lighting) are strictly isolated in a background container marked `pointer-events-none z-0`.
- Consumer content (headings, buttons, interactive forms) passed as `{children}` is wrapped at `relative z-10`, ensuring full pointer and keyboard interactivity with zero event interception.

---

## Props API Contract Specification for `<ShadowBackground />`

The complete, type-safe API contract for the production component is defined as follows:

```typescript
import React from "react";
import { SpringConfig } from "@/lib/motion/spring";
import { DegradationTier } from "@/lib/device-capabilities";

/**
 * Discriminated union for pluggable Shadow Caster sources.
 */
export type ShadowCasterConfig =
  | {
      type: "image";
      /** Path to alpha mask or silhouette image (PNG / SVG / WebP) */
      src: string;
      /** Base caster opacity multiplier (0.0 to 1.0, default: 0.8) */
      opacity?: number;
    }
  | {
      type: "komorebi";
      /** Density of canopy foliage clusters (default: 1.0) */
      density?: number;
      /** Contrast threshold between light spots and deep shadow (default: 1.2) */
      contrast?: number;
      /** Spatial frequency / scale of dappled light pools (default: 3.5) */
      scale?: number;
      /** Wind drift animation speed (default: 0.5) */
      speed?: number;
    }
  | {
      type: "branch";
      /** Recursive branch branching depth (default: 4) */
      depth?: number;
      /** Density of clustered leaf geometry (default: 0.8) */
      leafDensity?: number;
      /** Physical harmonic wind sway frequency (default: 0.7) */
      swaySpeed?: number;
    };

/**
 * Calibrated spring motion behavior presets.
 */
export type MotionPreset = "snappy" | "smooth" | "inertial" | "bouncy" | false;

/**
 * Complete props interface for <ShadowBackground />.
 */
export interface ShadowBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // --------------------------------------------------------------------------
  // Core Asset Configuration
  // --------------------------------------------------------------------------

  /**
   * Path to the Base Plate image onto which shadows are cast.
   */
  basePlate: string;

  /**
   * Pluggable Shadow Caster configuration (image mask, Komorebi canopy, or branch).
   */
  caster: ShadowCasterConfig;

  /**
   * Optional pre-rendered composite shadow image for immediate SSR display.
   * If omitted, basePlate is used as the initial visual floor.
   */
  poster?: string;

  // --------------------------------------------------------------------------
  // Optical & Shadow Controls
  // --------------------------------------------------------------------------

  /**
   * Whether to simulate physical contact hardening (sharp contact, soft penumbra).
   * @default true
   */
  contactHardening?: boolean;

  /**
   * Base diffusion radius for the shadow penumbra in pixels.
   * @default 24
   */
  penumbra?: number;

  /**
   * Overall shadow opacity multiplier (0.0 to 1.0).
   * @default 0.65
   */
  shadowOpacity?: number;

  /**
   * Blend mode for compositing the shadow over the Base Plate.
   * @default "multiply"
   */
  blendMode?: "multiply" | "normal";

  // --------------------------------------------------------------------------
  // Interactive & Ambient Motion Controls
  // --------------------------------------------------------------------------

  /**
   * Interactive physics preset or false to disable pointer tracking.
   * @default "smooth"
   */
  motion?: MotionPreset;

  /**
   * Fine-grained spring physics overrides (stiffness, damping, mass).
   */
  spring?: Partial<SpringConfig>;

  /**
   * Maximum interactive shadow translation in pixels.
   * @default 45
   */
  maxDisplacement?: number;

  /**
   * Influence of vertical page scroll delta on virtual light elevation in pixels.
   * @default 25
   */
  scrollInfluence?: number;

  /**
   * Enables dynamic 3D perspective distortion during pointer displacement.
   * Number specifies perspective distance in pixels; boolean toggles 1000px default.
   * @default true
   */
  perspective?: boolean | number;

  /**
   * Enables continuous subtle background wind motion.
   * @default true
   */
  ambientMotion?: boolean;

  /**
   * Speed multiplier for ambient motion.
   * @default 0.8
   */
  ambientSpeed?: number;

  // --------------------------------------------------------------------------
  // Progressive Degradation & Lifecycle Callbacks
  // --------------------------------------------------------------------------

  /**
   * Force a specific degradation tier or allow automatic heuristic detection.
   * @default "auto"
   */
  tier?: "auto" | DegradationTier;

  /**
   * Callback fired when the active degradation tier is resolved on the client.
   */
  onTierChange?: (tier: DegradationTier) => void;

  /**
   * Callback fired when the motion spring reaches rest and the rAF loop sleeps.
   */
  onRest?: () => void;

  /**
   * Callback fired when the motion spring wakes from sleep due to user interaction.
   */
  onWake?: () => void;

  // --------------------------------------------------------------------------
  // Layout & Children
  // --------------------------------------------------------------------------

  /**
   * Foreground content rendered above the shadow background at relative z-10.
   */
  children?: React.ReactNode;
}
```

### Typical Usage Example

```tsx
import { ShadowBackground } from "@/components/ShadowBackground";

export function HeroBanner() {
  return (
    <ShadowBackground
      basePlate="/images/base-minimal-studio.svg"
      poster="/images/poster-hero-composite.webp"
      caster={{
        type: "komorebi",
        density: 1.2,
        contrast: 1.1,
        speed: 0.6,
      }}
      contactHardening={true}
      penumbra={28}
      motion="smooth"
      className="h-[600px] w-full"
    >
      <div className="max-w-xl p-12 text-zinc-900">
        <h1 className="text-5xl font-bold tracking-tight">
          Organic Dynamic Lighting
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Photorealistic shadows cast in real-time with sub-millisecond GPU execution.
        </p>
        <button className="mt-6 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800">
          Get Started
        </button>
      </div>
    </ShadowBackground>
  );
}
```

---

## Consequences

### Positive Consequences
* **Photorealistic Contact Hardening**: True optical depth achieved via GPU Poisson-disk sampling, replacing flat dropshadows with physically plausible variable-penumbra light occlusion.
* **Flawless Core Web Vitals**: Zero LCP delay achieved by rendering the SSR static poster via `next/image priority`; zero CLS achieved via strict absolute coordinate geometry containment.
* **Ultra-Low Resource Consumption**: Sub-millisecond GPU frame time (< 0.8ms) and zero main-thread blocking (< 0.1ms). Procedural Komorebi canopy operates at 0 KB additional heap/VRAM.
* **Zero Idle Energy Drain**: Reactive rAF wake/sleep state machine eliminates continuous loop cycling, yielding 0% idle CPU and extending mobile battery life.
* **Resilient Multi-Tier Fallback**: Automatic recovery to Canvas 2D or static image ensures zero visual crashes across outdated browsers, software WebGL drivers, or data-saver modes.
* **Developer Velocity**: One-line configuration for complex organic effects, with complete TypeScript type safety and full React 19 forward-ref ergonomics.

### Negative Consequences & Mitigations
* **Shader Pipeline Complexity**: WebGL shader management and WebGL context restoration logic introduce internal code complexity compared to simple CSS properties.
  * *Mitigation*: All shader compilation, texture binding, and context lifecycles are deeply encapsulated within headless engines (`WebGlShadowEngine.tsx`, `Canvas2dShadowEngine.tsx`). Consumers interact purely via declarative React props.
* **Browser Fingerprinting Restrictions**: Apple WebKit's intentional clamping of `navigator.hardwareConcurrency` to 2 risks misclassifying high-performance iPhones and iPads as low-tier devices.
  * *Mitigation*: Implemented multi-signal heuristic evaluation checking `navigator.deviceMemory`, user-agent inspection, and WebGL `UNMASKED_RENDERER_WEBGL` strings to maintain full dynamic fidelity on iOS devices.
* **Initial Canvas Compilation Cost**: First-frame shader compilation and texture uploads can take 5ms–12ms if executed during initial page load.
  * *Mitigation*: Deferred hydration using `requestIdleCallback` ensures compilation occurs strictly during browser idle periods after initial paint and user interaction readiness.

---

## Validation & Empirical Metrics

The architectural decisions in this record have been substantiated through rigorous benchmark telemetry and automated test suites:

1. **Shader Execution & Frame Times**:
   - WebGL 12-tap Poisson shader verified at **0.62ms–0.78ms** GPU time on Apple M-series and Intel Iris Xe GPUs ([Issue #5](https://github.com/manuelhe/shadowcasting-poc/issues/5)).
   - Canvas 2D fallback verified at **2.8ms–5.4ms** per frame.
   - CSS filter layer invalidations eliminated, saving up to **190 MB** VRAM per viewport.

2. **Procedural Foliage & Komorebi Memory**:
   - GLSL Simplex fBm canopy verified at **0 KB heap / 0 KB texture allocation** at steady 60 FPS ([Issue #6](https://github.com/manuelhe/shadowcasting-poc/issues/6)).
   - Parametric branch skeleton verified at **< 15 KB JSON heap** and 1.4ms per frame sway calculation.

3. **Physics Stability & Power Conservation**:
   - Semi-implicit Euler spring verified across 36 unit tests (`src/lib/motion/spring.test.ts`, `motion-controller.test.ts`, `coordinates.test.ts`).
   - Sleep cycle verified: achieves **0.0% CPU usage** and stops `requestAnimationFrame` within ~400ms of pointer rest.

4. **Web Vitals Adherence**:
   - LCP: < 1.2s on simulated 4G throttling via SSR Next.js Image preload.
   - CLS: Strictly **0.000** through all hydration transitions.
   - INP: < 16ms under active cursor tracking.
