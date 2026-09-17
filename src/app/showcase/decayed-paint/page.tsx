"use client";

import React from "react";
import { ShadowBackground } from "@/components/ShadowBackground";

export default function DecayedPaintShowcasePage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Decoupled Shadow Engine with Layered Children */}
      <ShadowBackground
        basePlate="/images/decayedpaint-background.webp"
        caster={{ type: "image", src: "/images/shadow-2.webp" }}
        className="absolute inset-0"
        tier="auto"
        motion={{ preset: "snappy", ambient: true, maxDisplacementPx: 45 }}
        shadowColor="#080808"
        shadowOpacity={0.85}
        penumbra={24}
      >
        {/* Bold Brutalist Display Typography & Industrial Metadata Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 flex flex-col justify-between pointer-events-none select-none h-full">
          {/* Top Industrial Header & Coordinates */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/20 pb-6 mb-12">
            <div className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 bg-white" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-bold">
                STUDY NO. 02 // INDUSTRIAL PATINA
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="px-2.5 py-1 border border-white/20 bg-neutral-900/60 backdrop-blur-sm text-white font-medium">
                BASE: DISTRESSED LEAD
              </span>
              <span className="px-2.5 py-1 border border-white/20 bg-neutral-900/60 backdrop-blur-sm text-white font-medium">
                CASTER: SHADOW-02
              </span>
              <span className="px-2.5 py-1 border border-white/20 bg-neutral-900/60 backdrop-blur-sm text-white font-medium">
                PRESET: SNAPPY
              </span>
            </div>
          </div>

          {/* Central Bold Brutalist Typography Header */}
          <div className="my-auto py-8">
            <h1
              data-testid="showcase-header"
              className="font-black uppercase tracking-tighter text-white leading-none text-6xl md:text-8xl"
            >
              PATINA &amp; OCCLUSION
            </h1>
            <p className="mt-6 max-w-2xl font-mono text-xs sm:text-sm text-zinc-300 uppercase tracking-wider leading-relaxed">
              Industrial distressed substrate study exploring dynamic natural shadow occlusion,
              harmonic second-order spring dynamics, and decoupled zero-VRAM static texture persistence.
            </p>
          </div>

          {/* Bottom Technical Badges & Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/20 mt-12 font-mono text-xs">
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px]">OCCLUSION OPACITY</div>
              <div className="text-white font-bold tracking-tight mt-0.5">0.85 ALPHA</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px]">PENUMBRA RADIUS</div>
              <div className="text-white font-bold tracking-tight mt-0.5">24PX GAUSSIAN</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px]">MAX DISPLACEMENT</div>
              <div className="text-white font-bold tracking-tight mt-0.5">±45PX SPRING DAMPED</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider text-[10px]">DIAGNOSTIC CONTROLS</div>
              <div className="text-white font-bold tracking-tight mt-0.5">STRICTLY 0 (NONE)</div>
            </div>
          </div>
        </div>
      </ShadowBackground>
    </div>
  );
}
