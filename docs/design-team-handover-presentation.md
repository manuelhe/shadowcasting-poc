# Presentation to Design: Living Light & Dynamic Shadowcasting

A presentation slide deck and creative handoff guide bridging product design and frontend engineering.

---

## Deck Overview

* **Format**: 10-Slide Structured Deck with Visual Layout Blueprints, Speaker Notes, and Asset Specifications
* **Target Audience**: Product Designers, Visual Designers, Design System Leads, and Creative Directors
* **Presenter**: Engineering Lead / Creative Technology Team
* **Objective**: Introduce the capabilities of the `<ShadowBackground />` engine, align on creative possibilities and physical constraints, and establish clear, standardized design deliverables.

---

## Slide 1: Living Light & Dynamic Shadowcasting

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   [Large Typography]                                                   │
│   LIVING LIGHT & DYNAMIC SHADOWS                                       │
│   From Static Interfaces to Tactile Architecture                       │
│                                                                        │
│   [Sub-headline]                                                       │
│   Next-Generation Ambient Backgrounds in Modern Web Applications       │
│                                                                        │
│   Engineering & Creative Technology Team · Autumn 2026                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Talking Points
* Web experiences often feel flat and clinical when confined to solid colors and static photography.
* Ambient motion (sunlight moving through window blinds, leaves rustling in a breeze) creates an immediate sense of tactile luxury and physical atmosphere.
* Today, we are demonstrating a new engineering capability: **`<ShadowBackground />`**, allowing real-time, interactive, photorealistic light and shadow without traditional video performance penalties.

### Speaker Notes
> "Welcome everyone. Today we are introducing a new design capability developed by engineering. For years, we've wanted our landing pages and editorial features to feel like living architectural spaces—with soft afternoon sunlight, wind-blown branch shadows, and subtle reaction to user movement. Today, we'll show you what the engineering team can build with your artwork, the optical realism we can achieve, and the exact assets we need from you to make it seamless."

---

## Slide 2: The Status Quo Dilemma (Video vs. 3D Engines)

### Visual Blueprint
```
┌───────────────────────────────────┬───────────────────────────────────┐
│ TRADITIONAL VIDEO LOOPS           │ MONOLITHIC 3D ENGINES             │
│ (MP4 / WebM / GIFs)               │ (Three.js / Spline / Babylon)     │
├───────────────────────────────────┼───────────────────────────────────┤
│ • 15 MB – 40 MB video payload     │ • 150 KB – 500 KB JS libraries    │
│ • Completely non-reactive         │ • 60 MB – 120 MB GPU memory       │
│ • Continuous battery depletion    │ • Mobile overheating & throttling │
│ • Severe Core Web Vitals penalty  │ • Complex 3D authoring tools      │
└───────────────────────────────────┴───────────────────────────────────┘
                                      ▼
     OUR SOLUTION: Decoupled Dynamic Shadowcasting (~140 KB Total)
```

### Key Talking Points
* **Video loops** look beautiful in Figma prototypes but break down on production web platforms. A 10-second 1080p video consumes 20MB+, depletes user data, drains mobile batteries, and cannot react to the user's cursor or scroll.
* **3D Engines (Three.js/Spline)** require heavy 3D asset downloads (meshes, textures) and cause mobile phones to overheat within 45 seconds, dropping framerate from 60 FPS down to 18 FPS.
* **Our Approach**: We achieve 100% of the visual fidelity using a lightweight **~140 KB total download** that runs at 60 FPS on everything from a flagship MacBook Pro to a mid-range Android phone.

### Speaker Notes
> "As designers, you've probably proposed background video loops before, only to have engineering reject them because of bandwidth and mobile battery drain. Or you tried Spline 3D, and the page took 4 seconds to load. We built this component specifically to end that compromise. We get the rich, organic ambiance of video, but with zero lag, instant page load, and real-time responsiveness to user touch."

---

## Slide 3: The Architecture — The Decoupled Model

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│  Layer 3: FOREGROUND UI CONTENT (z-index: 10)                          │
│  Headings, body copy, interactive buttons, navigation                  │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 2: DYNAMIC SHADOW CANVAS (Transparent WebGL / Canvas 2D)        │
│  • Pure black shadow silhouette with alpha gradient                    │
│  • Multiplied over background (mix-blend-mode: multiply)               │
│  • 5% overscan bleed (prevents edge clipping during camera tilt)       │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 1: STATIONARY BASE PLATE (Next.js Optimized Image)              │
│  • Architectural substrate (plaster, wood, concrete, stone)           │
│  • Stays completely rigid and stationary (just like a real wall)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Talking Points
* **Physical Realism**: In an actual room, when light shifts across a plaster wall, the wall does not move—only the shadow moves.
* **Layer 1 (The Base Plate)**: A clean photographic background image delivered through Next.js. It loads instantly and remains stationary.
* **Layer 2 (The Dynamic Shadow)**: An invisible, transparent canvas placed directly over the image that synthesizes the shadow and blends it using hardware-accelerated multiply.
* **Layer 3 (Foreground UI)**: Typography and interactive components sit cleanly on top, fully accessible and interactive.

### Speaker Notes
> "The secret to why this looks so realistic and runs so fast is the 'Decoupled Layer Architecture'. Early prototypes tried to tilt both the wall and the shadow in 3D, which made the wall look like a warped cardboard poster. By keeping your background photograph completely stationary and moving only the shadow across its surface, your eyes perceive genuine physical depth. Furthermore, because the browser handles the photo in the DOM, our shadow engine consumes 0 KB of redundant GPU texture memory."

---

## Slide 4: What Development Can Do With It

### Visual Blueprint
```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ INTERACTIVE PHYSICS     │ CONTACT HARDENING       │ AMBIENT WIND SWAY       │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Spring-damped tracking│ • Crisp near contact    │ • Gentle organic motion │
│ • Parallax tilt (±15°)  │ • Soft, diffused edges  │ • Zero battery cost at  │
│ • Multi-touch & scroll  │   at distance           │   rest (< 2% CPU)       │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Key Capabilities
1. **Interactive Cursor & Touch Tracking**:
   - The shadow casts dynamically based on pointer position or mobile touch.
   - We calibrate spring physics: **"smooth"** (luxurious, editorial), **"snappy"** (e-commerce, modern), **"inertial"** (heavy, cinematic).
2. **Optical Contact Hardening**:
   - Shadows in real life are sharp near the base of an object and diffuse into a soft penumbra further away. Our WebGL shader calculates this in real time.
3. **Ambient Wind Motion**:
   - When the user isn't moving, branches and leaves gently sway as if stirred by an outdoor breeze.
4. **Scroll-Driven Light Shifts**:
   - As the user scrolls down an editorial article, the light source position shifts gradually, simulating the sun moving across the sky.
5. **Smart Sleep for Battery Preservation**:
   - When interaction stops, the animation engine goes to sleep, consuming less than 2% CPU.

### Speaker Notes
> "Here is what we can do once you hand off your assets: We can make the shadow react to mouse movements with physical inertia. We can turn on 'Contact Hardening', meaning the branch near the top of the frame is razor-sharp, while the foliage lower down dissolves into soft, dreamy blur. We can simulate gentle breezes, or tie the light position directly to how far down the page the reader has scrolled. And unlike video, when the user stops moving, the engine goes to sleep so their laptop fan never turns on."

---

## Slide 5: Procedural Light (Zero-Asset Dappled Light)

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│   PROCEDURAL KOMOREBI (木漏れ日)                                       │
│   Sunlight filtering through canopy leaves, computed mathematically    │
│                                                                        │
│   [Visual comparison: Mathematical noise pattern vs. Sunlight on wall] │
│                                                                        │
│   • Asset Download: 0 KB (No silhouette image required)                │
│   • Infinite Variety: No looping seams or repeating gif artifacts      │
│   • Designer Controls: Density, Contrast, Scale, Wind Speed            │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Talking Points
* For dappled sunlight (*Komorebi*), you don't even need to draw foliage or export an SVG.
* Our engine contains a procedural shader that mathematically synthesizes wind-tossed dappled sunlight directly on the GPU.
* **Total asset download is 0 KB**. You only provide the background wall image; we control the light density, contrast, and wind speed using numerical parameters.

### Speaker Notes
> "One of our most powerful features is Procedural Komorebi—the Japanese term for sunlight filtering through trees. If you want a serene, dappled light effect on a minimalist interior or studio wall, you don't even need to draw a branch! We can generate the dappled light pattern entirely in code. You simply specify how dense you want the sunlight spots, how sharp the contrast should be, and how fast the wind should blow."

---

## Slide 6: Creative Boundaries — What We Can & Cannot Do

### Visual Blueprint
```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ WHAT WE CAN DO (High Confidence)      │ WHAT WE CANNOT DO (Engine Limitations)│
├───────────────────────────────────────┼───────────────────────────────────────┤
│ ✅ Planar surface casting             │ ❌ Casting across complex 3D meshes   │
│    (Walls, floors, cards, canvases)   │    (e.g., stairs, undulating statues) │
│ ✅ Variable softness & penumbra       │ ❌ Colored glass caustics             │
│ ✅ Real-time light direction changes  │    (Unless rendered into the texture) │
│ ✅ Vector silhouettes & alpha PNGs    │ ❌ Removing hard baked-in shadows from│
│ ✅ 60 FPS mobile performance          │    flat background stock photos       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### Clarifying Technical Constraints
* **What We Can Do**:
  - Cast shadows onto any planar or architectural background (drywall, wood panels, concrete, brushed metal, product cards).
  - Control shadow color, opacity, diffusion softness, and light angle.
  - Mix vector leaves, window frames, text outlines, or geometric silhouettes.
* **What We Cannot Do**:
  - We cannot cast shadows over irregular 3D geometry (like a winding staircase or human face) without a full 3D mesh engine.
  - We cannot extract shadows from a stock photo that already has strong, harsh sunlight baked into it. Your background photos must have soft, diffused, or ambient lighting.

### Speaker Notes
> "To keep our collaboration smooth, let's talk about creative boundaries. Our component is designed for planar architectural surfaces: walls, desktops, paper substrates, and UI cards. It is not a replacement for Unreal Engine—we cannot wrap a shadow around a 3D statue. Also, when selecting background photography, look for images with even, diffuse lighting. If a stock photo already has harsh midday shadows baked into the wallpaper, casting our dynamic shadow over it will look confusing."

---

## Slide 7: Design Deliverables — The 4 Essential Assets

### Visual Blueprint
```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ 1. BASE PLATE           │ 2. SHADOW CASTER        │ 3. STATIC POSTER        │ 4. INTENT SPEC SHEET    │
├─────────────────────────┼─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Clean substrate photo │ • Pure black silhouette │ • Flattened composite   │ • Light direction       │
│ • No baked shadows      │ • Vector SVG or         │ • Used for SSR / mobile │ • Penumbra softness     │
│ • 1920×1080 @ 1x/2x     │   32-bit alpha PNG      │   battery saver         │ • Motion preset & speed │
│ • WebP / AVIF format    │ • Explicit dimensions   │ • WebP format           │ • Contact hardening Y/N │
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### The Standard Handoff Package
For every shadowcasting section, the design team provides **four assets**:

1. **The Base Plate Image**: The clean photographic substrate without shadows (wood, concrete, studio backdrop).
2. **The Shadow Caster Silhouette**: The vector or alpha cutout shape that blocks light (branches, blinds, palm fronds).
3. **The Static Poster Fallback**: A flattened composite image of the Base Plate + Shadow in the resting position for instant page load on low-power devices.
4. **The Motion & Lighting Intent Sheet**: A quick list of values specifying light direction, shadow softness, and spring responsiveness.

### Speaker Notes
> "Here is our four-part delivery checklist. Whenever you design a hero header or feature section using this effect, we need these four items from your Figma file: First, the clean background photo. Second, the shadow silhouette cutout. Third, a static flattened export of the finished look for instant loading on slow mobile devices. And fourth, a quick spec sheet with your desired light direction and motion mood. Let's look at the exact export rules for each."

---

## Slide 8: Figma & Export Technical Specifications

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│                     ASSET EXPORT SPECIFICATION MATRIX                  │
├──────────────────────┬──────────────────────┬─────────────┬────────────┤
│ ASSET                │ FORMAT               │ RESOLUTION  │ MAX SIZE   │
├──────────────────────┼──────────────────────┼─────────────┼────────────┤
│ 1. Base Plate        │ WebP (Quality: 85%)  │ 1920 × 1080 │ < 120 KB   │
│                      │ or AVIF              │ (or 2560)   │            │
├──────────────────────┼──────────────────────┼─────────────┼────────────┤
│ 2. Shadow Caster     │ Optimized SVG        │ 800 × 600   │ < 25 KB    │
│    (Vector)          │ (Explicit W/H)       │ or 1200×900 │            │
├──────────────────────┼──────────────────────┼─────────────┼────────────┤
│ 2b. Shadow Caster    │ 32-bit PNG (Alpha)   │ 1024 × 1024 │ < 80 KB    │
│    (Photorealistic)  │ (Clean transparent)  │             │            │
├──────────────────────┼──────────────────────┼─────────────┼────────────┤
│ 3. Static Poster     │ WebP (Quality: 80%)  │ 1920 × 1080 │ < 140 KB   │
└──────────────────────┴──────────────────────┴─────────────┴────────────┘
```

### Golden Export Rules for Designers
1. **SVG Intrinsic Dimensions Rule (Critical for Chrome)**:
   - When exporting SVGs from Figma or Illustrator, **do not leave width and height empty or set to 100%**.
   - Ensure the exported `<svg>` element has explicit pixel dimensions matching its viewBox:
     ```xml
     <!-- CORRECT -->
     <svg width="800" height="600" viewBox="0 0 800 600" ...>

     <!-- INCORRECT (Triggers WebGL texture errors in Chromium) -->
     <svg width="100%" height="100%" viewBox="0 0 800 600" ...>
     ```
2. **Silhouette Color**:
   - The caster silhouette should be solid pure black (`#000000`).
   - Opacity gradients (e.g., foliage that thins out at leaf edges) should be achieved using layer opacity or alpha masks, not grey hex colors.
3. **Bleed & Crop**:
   - Do not crop the silhouette right up to the visible frame edge. Leave 15% breathing room around the outer foliage so that when the shadow sways or tilts, its stems don't abruptly end inside the viewport.

### Speaker Notes
> "Take note of rule number one! In Chrome on Mac, SVG textures fail to upload to the GPU if they don't have explicit pixel width and height attributes. When exporting from Figma, make sure your SVG frame has a fixed width and height (like 800 by 600) rather than '100%'. Also, always make your shadow silhouette pure black (#000000) using transparency for soft edges. And leave a little extra stem extending outside your frame so it doesn't get clipped when the wind sways."

---

## Slide 9: Motion & Lighting Spec Sheet (Handoff Template)

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│                SHADOWCASTING DESIGN INTENT TOKEN SHEET                 │
├────────────────────────────────────────────────────────────────────────┤
│ Section Name:          [ e.g., Hero Header / Editorial Feature ]       │
│ Base Plate Asset:      [ e.g., /assets/plaster-wall-dark.webp ]        │
│ Caster Asset:          [ e.g., /assets/palm-frond-silhouette.svg ]     │
├────────────────────────────────────────────────────────────────────────┤
│ LIGHTING PARAMETERS                                                    │
│ • Light Direction:     [ ] Top-Left   [X] Top-Right   [ ] Overhead     │
│ • Shadow Opacity:      [ 65% ] (Recommended: 40% – 75%)                │
│ • Penumbra Softness:   [ ] Crisp (0.01)  [X] Soft (0.03)  [ ] Hazy(0.06)│
│ • Contact Hardening:   [X] Enabled       [ ] Disabled                  │
├────────────────────────────────────────────────────────────────────────┤
│ MOTION PERSONALITY                                                     │
│ • Motion Preset:       [X] Smooth (Editorial)    [ ] Snappy (Modern)   │
│                        [ ] Inertial (Heavy)      [ ] Bouncy            │
│ • Ambient Wind Sway:   [X] Gentle Breeze         [ ] Off               │
│ • Scroll Coupling:     [ ] Enabled (30%)         [X] Disabled          │
└────────────────────────────────────────────────────────────────────────┘
```

### Explanation of Designer Choices
* **Light Direction**: Indicates where the hypothetical window or sunbeam is positioned relative to the frame.
* **Penumbra Softness**: Determines whether the shadow looks like direct desert midday sun (`Crisp`), diffused afternoon window light (`Soft`), or overcast morning haze (`Hazy`).
* **Contact Hardening**: Turn on for branches, plants, or furniture rooted at one edge; turn off for cloud shadows or floating canopies.
* **Motion Personality**: Choose `Smooth` for luxury or editorial brands, `Snappy` for tech products, or `Inertial` for heavy cinematic presentations.

### Speaker Notes
> "To make handing off your designs as easy as filling out a brief, we created this standard Token Sheet. You can paste this right into your Figma specs. You pick the light angle, check off whether you want the shadow to be crisp or dreamy, toggle contact hardening on or off, and select a motion personality like 'Smooth' or 'Snappy'. Our component reads these exact parameters."

---

## Slide 10: Summary & Collaborative Next Steps

### Visual Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│                           COLLABORATIVE WORKFLOW                       │
│                                                                        │
│   Step 1: Ideation & Substrate Selection                               │
│   Design selects background photo + silhouette motif in Figma.         │
│                              ▼                                         │
│   Step 2: Token Calibration & Export                                   │
│   Design exports WebP + SVG assets and fills out the Token Sheet.      │
│                              ▼                                         │
│   Step 3: Engineering Integration                                      │
│   Engineering mounts `<ShadowBackground />` with verified 60 FPS.      │
│                              ▼                                         │
│   Step 4: Live Interactive Review                                      │
│   Joint review using live Diagnostic HUD to fine-tune lighting.        │
│                                                                        │
│   Showcase Gallery: /showcase · Executive Benchmarks: /conclusions     │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Takeaways
1. **Uncompromised Design Fidelity**: We can execute rich, dynamic, organic lighting without sacrificing web performance, SEO, or battery life.
2. **~140 KB Total Payload**: 99% bandwidth savings compared to pre-rendered video loops.
3. **Immediate Prototyping**: You can inspect live working examples right now in our repository showcase:
   - `/showcase` (Showcase gallery of editorial, wood, and scroll scenarios).
   - `/conclusions` (Full technical benchmarks and VRAM measurements).
4. **Next Steps**: Let's pick one upcoming hero header or feature section in our current sprint and build it together!

### Speaker Notes
> "To wrap up: with `<ShadowBackground />`, we no longer have to compromise our creative ambitions for web performance. We get living, breathing light and shadow at 60 FPS, with a tiny 140KB asset weight and 0.000 layout shift. The entire team can test out the live interactive demos right now at /showcase. Let's choose a feature in our next sprint to launch with this new capability. Thank you everyone, and let's open it up for questions!"
