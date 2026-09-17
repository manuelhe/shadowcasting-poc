"use client";

import React from "react";
import Link from "next/link";
import { ShadowBackground } from "@/components/ShadowBackground";
import { ArrowDown, Compass, Sparkles, MoveRight, SunMedium } from "lucide-react";

export default function ScrollTopShowcasePage() {
  const heroRef = React.useRef<HTMLElement>(null);
  const [heroOffset, setHeroOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      const heroHeight = heroRef.current?.offsetHeight || 800;
      const heroProgress = Math.min(1, Math.max(0, scrollY / (heroHeight || 800)));
      setHeroOffset({ x: 0, y: Math.round(heroProgress * 120) });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500/30">
      {/* 1. TOP HERO SECTION */}
      <section
        ref={heroRef}
        data-testid="scroll-top-hero-section"
        className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden"
      >
        {/* Dynamic Interactive Shadow Canvas Background */}
        <ShadowBackground
          basePlate="/images/wood-background.webp"
          caster={{ type: "image", src: "/images/shadow-2.webp" }}
          className="absolute inset-0"
          tier="auto"
          offset={heroOffset}
          motion={{
            preset: "smooth",
            scrollInfluence: 120,
            ambient: true,
            maxDisplacementPx: 50,
          }}
          shadowColor="#050505"
          shadowOpacity={0.8}
          penumbra={30}
        >
          {/* Subtle Vignette & Gradient Overlays for High Contrast Readability */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60 pointer-events-none"
            aria-hidden="true"
          />

          {/* White Editorial Header */}
          <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center gap-6 pt-16 mx-auto h-full justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest uppercase bg-zinc-950/60 border border-zinc-700/60 text-zinc-300 backdrop-blur-md shadow-lg">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Design Study 03 • Continuous Scroll Parallax</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white font-light drop-shadow-2xl">
              LIGHT IN TRANSIT
            </h1>

            <p className="max-w-2xl text-base sm:text-lg lg:text-xl text-zinc-200 font-light leading-relaxed drop-shadow-md">
              As the viewport descends, subtle virtual light vectors pivot across tactile architectural grain.
              Natural occlusion emerges through progressive scroll elevation.
            </p>

            {/* Scroll Prompt Call to Action */}
            <div className="pt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-medium tracking-widest uppercase text-zinc-300">
                <span className="w-8 h-[1px] bg-zinc-500/60" />
                <span>SCROLL DOWN TO ANIMATE OCCLUSION</span>
                <span className="w-8 h-[1px] bg-zinc-500/60" />
              </div>
              <div className="p-2 rounded-full border border-zinc-700/80 bg-zinc-900/50 text-amber-400 animate-bounce backdrop-blur-sm">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </ShadowBackground>
      </section>

      {/* 2. GENEROUS LONG-FORM EDITORIAL ARTICLE CONTENT */}
      <article
        data-testid="editorial-article-container"
        className="w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-24 flex flex-col gap-28 relative z-20"
      >
        {/* CHAPTER I */}
        <section data-testid="chapter-1" className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              Section 01
            </span>
            <div className="h-[1px] flex-1 bg-zinc-800" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white tracking-tight">
            I. The Geometry of Natural Occlusion
          </h2>

          <div className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            <p>
              In real architecture, shadows are not flat mathematical cutouts stamped onto materials.
              When diffuse sunlight filters through high branch canopies and structural lintels, the
              resulting penumbra softens according to the distance between the occluding object and
              the receiving surface. Near the contact point, edges appear razor sharp; as the light
              travels further across the plane, ray divergence blurs the boundary into a soft,
              breathing gradient.
            </p>
            <p>
              By decoupling the static Base Plate substrate from the transparent dynamic shadow synthesis
              canvas, web interfaces achieve genuine physical depth without redrawing heavy background
              textures. The substrate maintains photographic fidelity and zero-LCP instantaneous paint,
              while the dynamic shadow plane recalculates its penumbra spread at 60 frames per second.
            </p>
          </div>

          {/* Pull Quote */}
          <figure className="my-6 border-l-2 border-amber-500/80 pl-6 sm:pl-8 py-2">
            <blockquote className="text-xl sm:text-2xl font-serif italic text-zinc-100 font-normal leading-snug">
              “Shadow is not the absence of light, but the subtle assertion of form upon space — an
              acoustic resonance of geometry and distance.”
            </blockquote>
            <figcaption className="mt-3 text-xs font-mono uppercase tracking-wider text-zinc-400">
              — Principles of Architectural Radiosity, Studio Monograph
            </figcaption>
          </figure>

          {/* Technical Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">120px</div>
              <div className="text-sm font-medium text-zinc-200">Scroll Influence</div>
              <p className="text-xs text-zinc-400 leading-normal">
                Calibrated displacement ratio dynamically shifting occlusion along the vertical traversal vector.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">30px</div>
              <div className="text-sm font-medium text-zinc-200">Penumbra Softening</div>
              <p className="text-xs text-zinc-400 leading-normal">
                Multi-pass radial blur mimicking atmospheric light scattering across natural wood fibers.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
              <div className="text-amber-400 font-mono text-2xl font-semibold">0.80</div>
              <div className="text-sm font-medium text-zinc-200">Optical Opacity</div>
              <p className="text-xs text-zinc-400 leading-normal">
                Deep black multiplier blended via multiply mode to preserve tactile timber grain highlights.
              </p>
            </div>
          </div>
        </section>

        {/* CHAPTER II */}
        <section data-testid="chapter-2" className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              Section 02
            </span>
            <div className="h-[1px] flex-1 bg-zinc-800" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white tracking-tight">
            II. Fluid Spring Interactivity
          </h2>

          <div className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            <p>
              Traditional parallax effects often feel stiff or disconnected because they directly bind
              scroll offsets to element positions via rigid linear mappings. If the user scrolls rapidly
              or abruptly halts, linear transitions snap or jerk. In contrast, our motion controller
              governs the virtual light source with second-order spring physics.
            </p>
            <p>
              When a scroll event fires, the target coordinates update instantly, but the shadow caster
              glides toward its new state with critically damped inertia. The motion feels physical,
              weighted, and organic. Even while scrolling at high velocity, ambient swaying harmonic
              frequencies remain active, providing continuous micro-life.
            </p>
          </div>

          {/* Interactive Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <SunMedium className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white">Dynamic Elevation Tracking</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                As the hero exits the viewport, the virtual light elevation tilts smoothly. The shadow
                casts longer, softer silhouettes downward, creating the sensation of an afternoon sun
                dipping below the roofline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white">Compound Multi-Input Synthesis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Pointer gestures, touch drag interactions, scroll velocities, and ambient sinusoids
                sum seamlessly within the headless motion controller. No single input locks or overrides
                the others.
              </p>
            </div>
          </div>

          <figure className="my-6 border-l-2 border-amber-500/80 pl-6 sm:pl-8 py-2">
            <blockquote className="text-xl sm:text-2xl font-serif italic text-zinc-100 font-normal leading-snug">
              “Motion on the web should echo the physics of the physical realm: continuous, damped,
              and alive to every touch.”
            </blockquote>
          </figure>
        </section>

        {/* CHAPTER III */}
        <section data-testid="chapter-3" className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              Section 03
            </span>
            <div className="h-[1px] flex-1 bg-zinc-800" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white tracking-tight">
            III. Temporal Lighting Transitions
          </h2>

          <div className="space-y-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            <p>
              A crucial aspect of progressive enhancement is ensuring flawless degradation across diverse
              hardware. On high-performance desktop displays, WebGL renders contact hardening shaders with
              sub-pixel precision. On resource-constrained mobile hardware or when power-saving flags are
              active, the system smoothly switches to Canvas2D fallbacks or static posters without
              layout shifts or lost content.
            </p>
            <p>
              In this design study, the photographic warmth of <code className="text-amber-300 font-mono text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">wood-background.webp</code> pairs with the intricate botanical silhouette of <code className="text-amber-300 font-mono text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">shadow-2.webp</code>. Together, they transport the reader into a calm, sun-dappled interior where digital text feels etched into real organic matter.
            </p>
          </div>

          {/* Technical Specs Breakdown */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Substrate Asset</span>
              <span className="text-xs font-mono text-amber-300">wood-background.webp (2400x1600)</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Shadow Caster Texture</span>
              <span className="text-xs font-mono text-amber-300">shadow-2.webp (Botanical Shrub)</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Synthesis Engine</span>
              <span className="text-xs font-mono text-zinc-300">WebGL 2.0 / Canvas2D Fallback</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Idle Hydration Strategy</span>
              <span className="text-xs font-mono text-emerald-400">requestIdleCallback (timeout: 1000ms)</span>
            </div>
          </div>
        </section>

        {/* ARTICLE FOOTER / NAVIGATION */}
        <footer className="pt-16 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <span>← Back to Showcase Gallery</span>
          </Link>

          <Link
            href="/showcase/scroll-mid"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white transition-all shadow-lg hover:shadow-zinc-100/10"
          >
            <span>Next Study: Scroll Mid Break</span>
            <MoveRight className="w-4 h-4" />
          </Link>
        </footer>
      </article>
    </div>
  );
}
