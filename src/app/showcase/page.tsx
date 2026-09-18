"use client";

import React from "react";
import Link from "next/link";
import { ShadowBackground } from "@/components/ShadowBackground";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Trees,
  Palette,
  Scroll,
  BookOpen,
  Compass,
} from "lucide-react";

export interface ShowcaseStudy {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  assetPairings: {
    basePlate: string;
    shadowCasters: string;
    technique: string;
  };
  highlights: string[];
}

export const SHOWCASE_STUDIES: ShowcaseStudy[] = [
  {
    id: "wood-header",
    title: "Architectural Wood Header",
    subtitle: "Timber Materiality & Serif Typography",
    badge: "Study 01 • Architectural",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    description:
      "Warm architectural wood grain paired with soft organic foliage shadows, demonstrating natural branch and leaf sway overlying high-contrast editorial typography.",
    href: "/showcase/wood-header",
    icon: Trees,
    assetPairings: {
      basePlate: "wood-background.webp",
      shadowCasters: "grass.svg & shadow-2.webp",
      technique: "Decoupled Static Base Plate + Transparent Alpha WebGL",
    },
    highlights: [
      "High-resolution timber texture with zero LCP penalty",
      "Organic penumbra softening with harmonic sway",
      "Editorial serif typography overlay",
    ],
  },
  {
    id: "decayed-paint",
    title: "Decayed Paint Industrial",
    subtitle: "Distressed Concrete & Brutalist Sans",
    badge: "Study 02 • Industrial",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    description:
      "Grungy distressed industrial surface layered with moving shadow silhouette forms, showcasing bold brutalist typography with dynamic penumbra lighting.",
    href: "/showcase/decayed-paint",
    icon: Palette,
    assetPairings: {
      basePlate: "decayedpaint-background.webp",
      shadowCasters: "grass.svg & shadow-2.webp",
      technique: "Poisson Disk Soft Shadow Kernel + Pointer Tracking",
    },
    highlights: [
      "Tactile weathered plaster base plate",
      "Multi-caster shadow synthesis with interactive tilt",
      "Heavy grotesque sans editorial hierarchy",
    ],
  },
  {
    id: "scroll-top",
    title: "Scroll Parallax Hero",
    subtitle: "Viewport Exit Dynamic Displacement",
    badge: "Study 03 • Parallax",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    description:
      "Full-bleed hero banner tracking viewport exit progress. As the user scrolls downstream, the shadow shifts vertical displacement and virtual light angle dynamically.",
    href: "/showcase/scroll-top",
    icon: Scroll,
    assetPairings: {
      basePlate: "wood-background.webp",
      shadowCasters: "grass.svg",
      technique: "Normalized Viewport Progress (0.0 → 1.0 Hero Exit)",
    },
    highlights: [
      "Scroll-coupled shadow translation and light tilt",
      "Spring-damped physics eliminating scroll stutter",
      "Graceful transition into long-form downstream reading",
    ],
  },
  {
    id: "scroll-mid",
    title: "Mid-Article Shadow Break",
    subtitle: "Reading Flow Viewport Interlude",
    badge: "Study 04 • Editorial",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    description:
      "Long-form editorial reading layout featuring an embedded mid-article visual break. Shadow dynamics activate precisely as the element traverses the viewport center.",
    href: "/showcase/scroll-mid",
    icon: BookOpen,
    assetPairings: {
      basePlate: "decayedpaint-background.webp",
      shadowCasters: "grass.svg",
      technique: "Mid-Screen Intersection Tracking (0.0 → 1.0 Entry-to-Exit)",
    },
    highlights: [
      "Intersection-observer driven mid-screen resonance",
      "Distraction-free reading flow with tactile focal break",
      "Dynamic penumbra depth centered on viewport traversal",
    ],
  },
];

export default function ShowcaseGalleryPage() {
  return (
    <div className="w-full flex flex-col items-center pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle Ambient Background Hero Preview - Architectural Timber Plate */}
      <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden pointer-events-none -z-10 opacity-25">
        <ShadowBackground
          basePlate="/images/wood-background.webp"
          caster={{
            type: "image",
            src: "/images/grass.svg",
          }}
          penumbra={28}
          motion={{ preset: "smooth", ambient: true, ambientSpeed: 0.3 }}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="max-w-6xl w-full flex flex-col gap-12">
        {/* Gallery Hero Header */}
        <header className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>DESIGN STUDIES SUITE • SPEC #21</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans">
            Dynamic Shadowcasting Gallery
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            A curated suite of four real-world design studies demonstrating decoupled
            transparent alpha shadow rendering, natural harmonic physics, and viewport-reactive
            scroll parallax — crafted for production performance with zero LCP penalty.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Zero-LCP Decoupled Layering</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>60 FPS WebGL Alpha Synthesis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Zero Developer Controls</span>
            </div>
          </div>
        </header>

        {/* 4 Studies Grid */}
        <section aria-label="Showcase Design Studies" className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SHOWCASE_STUDIES.map((study) => {
            const Icon = study.icon;
            return (
              <article
                key={study.id}
                data-testid={`showcase-card-${study.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/70 shadow-xl shadow-black/40"
              >
                <div className="flex flex-col gap-4">
                  {/* Card Header & Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${study.badgeColor}`}
                    >
                      {study.badge}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-300 group-hover:text-amber-400 group-hover:border-amber-500/30 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition">
                      {study.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{study.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                    {study.description}
                  </p>

                  {/* Asset Pairings Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col gap-1.5 text-xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-semibold">
                      <Layers className="w-3 h-3 text-sky-400" />
                      <span>Asset &amp; Architectural Pairings</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-zinc-300 text-[11px]">
                      <span className="text-zinc-400">Base Plate:</span>
                      <code className="text-amber-300 font-mono text-[10px] break-all">
                        {study.assetPairings.basePlate}
                      </code>
                      <span className="text-zinc-400">Shadow:</span>
                      <code className="text-sky-300 font-mono text-[10px] break-all">
                        {study.assetPairings.shadowCasters}
                      </code>
                      <span className="text-zinc-400">Technique:</span>
                      <span className="text-zinc-200">{study.assetPairings.technique}</span>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <ul className="flex flex-col gap-1 text-xs text-zinc-400">
                    {study.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400/80 mt-0.5 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Link */}
                <div className="pt-6 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Route: {study.href}</span>
                  <Link
                    href={study.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm active:scale-95"
                  >
                    <span>View Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Return to Developer Playground Banner */}
        <footer className="mt-8 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Looking for Developer Telemetry?</h3>
              <p className="text-xs text-zinc-400">
                Explore real-time Web Vitals, dynamic degradation gating, and CPU stress harnesses in the playground.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <span>Return to Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
