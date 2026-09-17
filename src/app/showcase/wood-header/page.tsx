import React from "react";
import type { Metadata } from "next";
import { ShadowBackground } from "@/components/ShadowBackground";

export const metadata: Metadata = {
  title: "Organic Light & Timber — Architectural Wood Header Showcase",
  description:
    "An architectural editorial study pairing a natural timber Base Plate with realistic soft shadowcasting and refined serif typography.",
};

export default function WoodHeaderShowcasePage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Shadowcasting Layer with Layered Children */}
      <ShadowBackground
        basePlate="/images/wood-background.webp"
        caster={{ type: "image", src: "/images/shadow-1.webp" }}
        className="absolute inset-0"
        tier="auto"
        motion={{ preset: "smooth", ambient: true, maxDisplacementPx: 40 }}
        shadowColor="#050505"
        shadowOpacity={0.82}
        penumbra={28}
      >
        {/* Stylized White Editorial Serif Display Typography Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center pointer-events-none select-none h-full justify-center">
          {/* Architectural Taxonomy Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md mb-8 sm:mb-10 shadow-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-200 font-medium">
              STUDY 01 // ARCHITECTURAL MATERIALITY
            </span>
          </div>

          {/* Ultra-Large White Serif Display Header */}
          <h1
            data-testid="wood-header-title"
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-tight text-white font-normal leading-[0.95] drop-shadow-2xl text-balance max-w-4xl"
          >
            ORGANIC LIGHT &amp; TIMBER
          </h1>

          {/* Refined Architectural Subtitle */}
          <p
            data-testid="wood-header-subtitle"
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-neutral-200 font-light max-w-2xl leading-relaxed tracking-wide drop-shadow-md text-pretty"
          >
            A physical study exploring natural branch shadows drifting across an
            organic timber substrate. Decoupled alpha shadows render with variable
            penumbra depth over an unmoving, photorealistic Base Plate.
          </p>

          {/* Architectural Specifications Matrix */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs font-mono text-neutral-300">
            <span className="px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm">
              BASE: WOOD-BACKGROUND.WEBP
            </span>
            <span className="text-neutral-500">•</span>
            <span className="px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm">
              CASTER: SHADOW-1.WEBP
            </span>
            <span className="text-neutral-500">•</span>
            <span className="px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm">
              PENUMBRA: 28PX
            </span>
            <span className="text-neutral-500">•</span>
            <span className="px-3 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-sm">
              OPACITY: 0.82
            </span>
          </div>
        </div>
      </ShadowBackground>
    </div>
  );
}
