# Shadowcasting Background Component

A performant, progressively enhanced Next.js background component that casts realistic dynamic and procedural shadows over background imagery.

## Language

**Base Plate**:
The background layer (image, color, or gradient) onto which cast shadows are composited. By default, it is completely static and rigid, unaffected by interactive motion or 3D perspective distortion.
_Avoid_: Background image, canvas floor, backdrop

**Base Plate Motion**:
An optional configuration mode that couples the Base Plate to interactive pointer and 3D perspective motion alongside the cast shadow, rather than leaving the Base Plate static.
_Avoid_: Camera tilt, whole-page parallax

**Shadow Caster**:
The silhouette, alpha mask, or procedural geometry source that defines the shape blocking light to produce a shadow.
_Avoid_: Mask image, silhouette layer, occluder

**Shadow Synthesis Engine**:
The rendering subsystem (CSS/SVG, Canvas 2D, or WebGL) responsible for projecting, blurring, and compositing the cast shadow.
_Avoid_: Blur processor, renderer, filter layer

**Penumbra**:
The diffused, soft edge of a cast shadow where light is partially occluded.
_Avoid_: Blur radius, feathering

**Contact Hardening**:
The optical effect where shadows are sharp near the contact surface and become progressively softer as distance increases.
_Avoid_: Gradient blur, distance blur

**Static Poster Fallback**:
A single static image rendered during SSR or displayed on low-end devices to eliminate runtime rendering cost and preserve Core Web Vitals.
_Avoid_: Placeholder, thumbnail, backup image

**Degradation Tier**:
The client performance classification (such as low-end mobile, reduced-motion, or high-performance desktop) determining dynamic fidelity.
_Avoid_: Device level, capability mode

**Ambient Motion**:
Continuous background animation of the shadow caster (such as gentle wind swaying branches or shifting foliage) independent of user interactions.
_Avoid_: Idle loop, wind animation

**Interactive Motion**:
Dynamic adjustments to shadow perspective, displacement, or penumbra driven by user events such as scrolling, pointer movement, or touch.
_Avoid_: Event animation, reactive shadow
