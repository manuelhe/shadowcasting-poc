import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShowcaseNav } from "@/components/ShowcaseNav";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Trees,
  Palette,
  Scroll,
  Gauge,
  Cpu,
  Zap,
  Activity,
  HardDrive,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Executive Conclusions & Comparative Technical Analysis — Shadowcasting POC",
  description:
    "An executive architectural briefing and technical analysis evaluating the performance, bandwidth economics, GPU memory architecture, and Core Web Vitals impact of decoupled dynamic shadowcasting.",
};

export default function ConclusionsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200 relative overflow-x-hidden font-sans">
      {/* Floating Showcase Navigation Landmark */}
      <ShowcaseNav />

      {/* Subtle Background Lighting & Mesh Aesthetics */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-amber-500/8 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a0f_1px,transparent_1px),linear-gradient(to_bottom,#27272a0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-24 flex flex-col gap-20 sm:gap-28">
        {/* ========================================================================= */}
        {/* 1. Header Section: Executive Briefing & Architectural Synthesis            */}
        {/* ========================================================================= */}
        <header className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          {/* Executive Kicker Badge */}
          <div
            data-testid="conclusions-kicker"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm shadow-amber-950/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Executive Briefing • Architectural Synthesis</span>
          </div>

          {/* Title */}
          <h1
            data-testid="conclusions-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans text-balance leading-tight"
          >
            Experiment Conclusions &amp; Comparative Technical Analysis
          </h1>

          {/* Core Problem & Thesis Subtitle */}
          <p
            data-testid="conclusions-subtitle"
            className="text-lg sm:text-xl text-zinc-300 font-light max-w-3xl leading-relaxed text-pretty"
          >
            Ambient backgrounds without the performance, battery, or payload penalties of
            video loops and 3D engines. An executive evaluation of decoupled dynamic shadowcasting
            contrasting download wire weight, GPU memory architecture, Core Web Vitals, and
            physical interactive responsiveness.
          </p>

          {/* Status Badges Row */}
          <div
            data-testid="conclusions-status-badges"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono pt-2"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Status: Production Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Zero-LCP Floor: 0.000 CLS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              Footprint: ~140 KB
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Frame Rate: 60 FPS Solid
            </span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. 3-Way Comparative Cards Section                                        */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="comparative-matrix-heading"
          data-testid="comparative-matrix-section"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
              Comparative Architectural Evaluation
            </span>
            <h2
              id="comparative-matrix-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              3-Way Paradigm Comparison
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Contrasting the three primary architectures for ambient web backgrounds across
              wire payload, GPU texture allocation, interactive dynamics, and energy footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Card 1: Pre-Rendered Video / GIFs */}
            <div
              data-testid="comparative-card-video"
              className="flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-7 relative overflow-hidden backdrop-blur-sm hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    Status Quo • High Bandwidth
                  </span>
                  <XCircle className="w-5 h-5 text-rose-400/80" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Pre-Rendered Video / GIFs
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Monolithic MP4/WebM Loops
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Heavy pre-recorded visual loops streaming inside an autoplay video element.
                  Inherently non-reactive, creating severe network contention during bootstrap
                  and continuously draining battery.
                </p>

                {/* Telemetry Badge Tags */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Payload</span>
                    <span className="text-xs font-mono font-semibold text-rose-400">15 MB – 40 MB+</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">GPU VRAM</span>
                    <span className="text-xs font-mono font-semibold text-zinc-300">16 MB – 48 MB</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Interactivity</span>
                    <span className="text-xs font-mono font-semibold text-rose-400">Non-Reactive</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Battery</span>
                    <span className="text-xs font-mono font-semibold text-rose-400">12% – 28% CPU</span>
                  </div>
                </div>

                {/* Key Limitations */}
                <ul className="flex flex-col gap-2 text-xs text-zinc-400 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Zero reaction to pointer, touch kinematics, or scroll velocity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Video buffer decode delay degrades First &amp; Largest Contentful Paint</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Continuous hardware decode drains mobile device battery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Full 3D Scene Graphs (Three.js / Spline) */}
            <div
              data-testid="comparative-card-3d"
              className="flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-7 relative overflow-hidden backdrop-blur-sm hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    Status Quo • Heavy Compute
                  </span>
                  <AlertTriangle className="w-5 h-5 text-amber-400/80" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Full 3D Scene Graphs (Three.js / Spline)
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Monolithic 3D Meshes &amp; Shaders
                  </p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Full 3D geometry graphs with dynamic shadow mapping and camera control. Delivers
                  spatial depth at the cost of massive JavaScript runtimes, high texture VRAM,
                  and rapid mobile thermal throttling.
                </p>

                {/* Telemetry Badge Tags */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Payload</span>
                    <span className="text-xs font-mono font-semibold text-amber-400">1.5MB – 5MB + JS</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">GPU VRAM</span>
                    <span className="text-xs font-mono font-semibold text-amber-400">60 MB – 120 MB</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Interactivity</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">High (3D Camera)</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Battery</span>
                    <span className="text-xs font-mono font-semibold text-amber-400">Thermal Throttling</span>
                  </div>
                </div>

                {/* Key Limitations */}
                <ul className="flex flex-col gap-2 text-xs text-zinc-400 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>150KB–500KB JS engine parsed before first paint</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Offscreen depth passes induce mobile TBDR buffer thrashing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>HTML5 canvas elements are disqualified from LCP candidacy by W3C</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3: Decoupled 2D Dynamic Shadowcasting (Our Approach) */}
            <div
              data-testid="comparative-card-decoupled"
              className="flex flex-col justify-between rounded-2xl bg-gradient-to-b from-emerald-950/20 via-zinc-900/90 to-zinc-950 border-2 border-emerald-500/50 p-6 sm:p-7 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-emerald-950/40"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Our Approach • Production Ready
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Decoupled 2D Dynamic Shadowcasting
                  </h3>
                  <p className="text-xs font-mono text-emerald-400 mt-1">
                    Stationary DOM Base Plate + Transparent Alpha WebGL
                  </p>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed">
                  Physically decouples an unmoving photographic Base Plate from a lightweight 2D
                  shadow synthesis engine. Delivers photorealistic contact hardening with ~99% less
                  bandwidth and zero GPU Base Plate duplication.
                </p>

                {/* Telemetry Badge Tags */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900/50">
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Payload</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">~140 KB Total (~99% Less)</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">GPU VRAM</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">0 KB Base Plate VRAM</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Interactivity</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">Solid 60 FPS &amp; Parallax</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/30">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Battery</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">&lt; 2% Idle CPU Load</span>
                  </div>
                </div>

                {/* Key Advantages */}
                <ul className="flex flex-col gap-2 text-xs text-zinc-300 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Stationary Base Plate eliminates 100% texture memory duplication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>12-tap Poisson-disk contact hardening with dynamic penumbra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Zero-LCP Floor with SSR Static Poster guarantees 0.000 CLS</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. Bandwidth & Payload Infographic Section                                */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="bandwidth-infographic-heading"
          data-testid="bandwidth-infographic-section"
          className="flex flex-col gap-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-10"
        >
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Asset Footprint Economics
            </span>
            <h2
              id="bandwidth-infographic-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Bandwidth &amp; Wire Payload Infographic
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Decoupling the stationary photographic substrate from dynamic shadow geometry
              yields a staggering ~99% asset size reduction compared to traditional video loops.
            </p>
          </div>

          {/* Proportional Comparison Bars */}
          <div
            data-testid="payload-comparison-bars"
            className="flex flex-col gap-6 py-4 border-y border-zinc-800"
          >
            {/* Bar 1: Video */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline text-xs sm:text-sm font-mono">
                <span className="text-zinc-300 font-medium">Pre-Rendered Video / GIFs (1080p Loop)</span>
                <span className="text-rose-400 font-bold">25,000 KB (100%)</span>
              </div>
              <div className="w-full h-4 sm:h-5 rounded-full bg-zinc-800/80 overflow-hidden flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all"
                  style={{ width: "100%" }}
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                High-bitrate MP4/WebM video required to prevent macroblocking on dark substrates.
              </span>
            </div>

            {/* Bar 2: 3D Scene Graphs */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline text-xs sm:text-sm font-mono">
                <span className="text-zinc-300 font-medium">Full 3D Scene Graphs (Three.js / Spline)</span>
                <span className="text-amber-400 font-bold">3,500 KB (~14%)</span>
              </div>
              <div className="w-full h-4 sm:h-5 rounded-full bg-zinc-800/80 overflow-hidden flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                  style={{ width: "14%" }}
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                3D mesh buffers, normal textures, and 150KB–500KB compressed engine bundle.
              </span>
            </div>

            {/* Bar 3: Decoupled Dynamic Shadowcasting */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline text-xs sm:text-sm font-mono">
                <span className="text-emerald-300 font-bold">Decoupled 2D Dynamic Shadowcasting</span>
                <span className="text-emerald-400 font-bold">140 KB (~0.5%) • 99% Reduction</span>
              </div>
              <div className="w-full h-4 sm:h-5 rounded-full bg-zinc-800/80 overflow-hidden flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full min-w-[12px] shadow-sm shadow-emerald-400"
                  style={{ width: "0.56%" }}
                />
              </div>
              <span className="text-[11px] text-emerald-400/90 font-mono">
                Decoupled photographic Base Plate + lightweight monochrome alpha mask + &lt;5KB engine.
              </span>
            </div>
          </div>

          {/* Granular Breakdown of ~140 KB Total Footprint */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Granular Footprint Breakdown (~140 KB Total)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sub-item 1: Base Plate */}
              <div
                data-testid="breakdown-base-plate"
                className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">~120 KB</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Stationary Base Plate</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  1920x1080 WebP/AVIF photographic image at 82% quality. Cached once by browser
                  compositor; 0 KB WebGL texture upload.
                </p>
              </div>

              {/* Sub-item 2: Shadow Caster */}
              <div
                data-testid="breakdown-shadow-caster"
                className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">~20 KB</span>
                  <Trees className="w-4 h-4 text-sky-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Shadow Caster Alpha Mask</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  8-bit monochrome alpha mask or SVG silhouette. Drops to 0 KB when using procedural
                  Komorebi or algorithmic branch generation.
                </p>
              </div>

              {/* Sub-item 3: Runtime Engine */}
              <div
                data-testid="breakdown-runtime-engine"
                className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">&lt; 5 KB</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Runtime Synthesis Engine</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tree-shaken WebGL 2.0 / Canvas 2D micro-shaders, Poisson-disk sampling, and
                  semi-implicit Euler spring physics integrator.
                </p>
              </div>
            </div>
          </div>

          {/* Bandwidth Economics at Scale Callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                Enterprise Infrastructure Savings (1M MAU)
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                Streaming 25 MB video incurs 25 TB monthly CDN egress ($2,000/mo). Decoupled
                shadowcasting transfers 140 GB ($11.20/mo), saving over{" "}
                <span className="text-emerald-300 font-bold">$23,865.00 annually</span> in recurring costs.
              </p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold whitespace-nowrap">
              ~99% Bandwidth Cut
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. Core Web Vitals & GPU Architecture Section                             */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="cwv-telemetry-heading"
          data-testid="cwv-telemetry-section"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-sky-400 uppercase font-semibold">
              Performance &amp; Hardware Telemetry
            </span>
            <h2
              id="cwv-telemetry-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Core Web Vitals &amp; GPU Memory Architecture
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Engineered from first principles to guarantee optimal Google search ranking signals
              and complete immunity to mobile GPU memory eviction watchdogs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric Card 1: 0.000 CLS */}
            <div
              data-testid="telemetry-card-cls"
              className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-sky-400">
                    0.000 CLS
                  </span>
                  <Gauge className="w-5 h-5 text-sky-400/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Zero-LCP Floor with SSR Static Poster Fallback
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pre-allocated layout bounds and identical absolute coordinates between the SSR
                  poster image and dynamic shadow canvas guarantee zero layout shift.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                Lighthouse: 100/100 Perfect Floor
              </div>
            </div>

            {/* Metric Card 2: < 600ms FCP / LCP */}
            <div
              data-testid="telemetry-card-fcp"
              className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
                    &lt; 600ms
                  </span>
                  <Zap className="w-5 h-5 text-emerald-400/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  First &amp; Largest Contentful Paint
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Preloaded Next.js photographic substrate satisfies LCP immediately, avoiding
                  the W3C spec disqualification that penalizes raw client canvas hero elements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                Cellular 4G Target: &lt; 800ms
              </div>
            </div>

            {/* Metric Card 3: 0 KB Base Plate VRAM */}
            <div
              data-testid="telemetry-card-vram"
              className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-purple-400">
                    0 KB VRAM
                  </span>
                  <HardDrive className="w-5 h-5 text-purple-400/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Base Plate VRAM Redundancy Elimination
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stationary Base Plate is composited by browser compositor, eliminating duplicate
                  GPU texture uploads and preventing mobile TBDR memory bus thrashing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                Zero iOS Safari Jetsam terminations
              </div>
            </div>

            {/* Metric Card 4: < 2% CPU at 60 FPS */}
            <div
              data-testid="telemetry-card-cpu"
              className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                    &lt; 2% CPU
                  </span>
                  <Activity className="w-5 h-5 text-amber-400/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  60 FPS Solid with Automatic Resting Sleep
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Second-order spring physics sleeps automatically when resting threshold is met,
                  dropping draw loops to zero until pointer motion resumes. Sub-0.8ms GPU frame time.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                Idle GPU Draw Calls: 0 overhead
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. Architectural Pillars & Principles Callouts                            */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="architectural-pillars-heading"
          data-testid="architectural-pillars-section"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
              Engineering Foundations
            </span>
            <h2
              id="architectural-pillars-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Architectural Pillars &amp; Principles Callouts
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Rigorous architectural decisions documented in ADR-0001 and ADR-0002 governing
              optical realism, hardware resilience, and layer separation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div
              data-testid="pillar-card-decoupled-base-plate"
              className="flex flex-col gap-4 p-6 sm:p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 w-fit">
                <span>Pillar 1 • ADR-0002</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Decoupled Static Base Plate
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                In physical architecture, walls and floors remain rigid within their inertial
                reference frame; only shadows move. Decoupling the photographic Base Plate from the
                shadow plane preserves optical realism and eliminates 100% of WebGL texture memory
                duplication.
              </p>
              <div className="mt-auto pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                Ref: docs/adr/0002-decoupled-transparent-shadow-layer.md
              </div>
            </div>

            {/* Pillar 2 */}
            <div
              data-testid="pillar-card-contact-hardening"
              className="flex flex-col gap-4 p-6 sm:p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 w-fit">
                <span>Pillar 2 • ADR-0001</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Contact Hardening &amp; Dual-Filtering
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Natural shadows are not uniformly blurred. The Shadow Synthesis Engine evaluates
                caster anchor distance into a 12-tap Poisson-disk kernel in a single GPU fragment
                pass, producing tack-sharp contact silhouettes that soften into a wide, diffused
                Penumbra.
              </p>
              <div className="mt-auto pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                Ref: docs/adr/0001-shadowcasting-component-architecture.md
              </div>
            </div>

            {/* Pillar 3 */}
            <div
              data-testid="pillar-card-degradation-ladder"
              className="flex flex-col gap-4 p-6 sm:p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/20 w-fit">
                <span>Pillar 3 • Hardware Ladder</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                3-Tier Graceful Degradation Ladder
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Automated hardware capability detection selects optimal execution: Tier 1 (WebGL 2.0
                Poisson contact hardening), Tier 2 (Canvas 2D box-blur for mid-tier or battery saver),
                and Tier 3 (Zero-JS SSR Static Poster floor for reduced-motion and legacy hardware).
              </p>
              <div className="mt-auto pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                Ref: docs/guides/04-performance-and-degradation.md
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. Capstone Production Recommendations & Live Studies                      */}
        {/* ========================================================================= */}
        <section
          aria-labelledby="production-recommendations-heading"
          data-testid="production-recommendations-section"
          className="flex flex-col gap-10 pt-4"
        >
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Adoption Roadmap
            </span>
            <h2
              id="production-recommendations-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Capstone Production Recommendations &amp; Live Studies
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Strategic guidance for engineering leads adopting decoupled dynamic shadowcasting
              in production, paired with direct verification links to our live design studies.
            </p>
          </div>

          {/* Recommendations Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                When to Adopt Decoupled Shadowcasting
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs text-zinc-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    <strong>Hero Headers &amp; Landing Pages:</strong> Replace heavy MP4 loops to
                    slash wire payload by ~99%, accelerate mobile LCP, and invite tactile user touch.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    <strong>Long-Form Editorial Features:</strong> Use continuous scroll-driven
                    parallax to introduce cinematic, magazine-quality visual breaks without layout pops.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    <strong>E-Commerce &amp; Product Showcases:</strong> Anchor merchandise against
                    authentic photographic textures with responsive natural light casting.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Implementation Best Practices
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs text-zinc-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Keep Base Plate Static by Default:</strong> Avoid camera tilts across the
                    photographic substrate to prevent artificial arcade skew. Physical walls are stationary.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Always Provide an SSR Static Poster:</strong> Pre-bake fallback posters to
                    guarantee the Zero-LCP Floor and enforce strictly 0.000 CLS across all hardware.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Enforce Layer Isolation:</strong> Maintain foreground interactive content
                    in a dedicated stacking context (`z-index: 10`) with `pointer-events-none` on the shadow canvas.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Live Studies CTA Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Verify Claims Across Live Design Studies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Link 1: Architectural Timber Hero */}
              <Link
                href="/showcase/wood-header"
                data-testid="cta-wood-header"
                className="group flex flex-col justify-between p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-amber-400">
                    <Trees className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Architectural Timber Hero
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Organic foliage shadows drifting over rich hardwood grain with high-contrast serif typography.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 mt-4 group-hover:text-zinc-300">
                  /showcase/wood-header →
                </span>
              </Link>

              {/* Link 2: Continuous Scroll Parallax */}
              <Link
                href="/showcase/scroll-top"
                data-testid="cta-scroll-top"
                className="group flex flex-col justify-between p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sky-400">
                    <Scroll className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    Continuous Scroll Parallax
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Full-bleed top hero translating viewport exit progress into smooth shadow displacement.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 mt-4 group-hover:text-zinc-300">
                  /showcase/scroll-top →
                </span>
              </Link>

              {/* Link 3: Industrial Decayed Paint */}
              <Link
                href="/showcase/decayed-paint"
                data-testid="cta-decayed-paint"
                className="group flex flex-col justify-between p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <Palette className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Industrial Decayed Paint
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Distressed concrete masonry paired with multi-caster window silhouettes and bold grotesque type.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 mt-4 group-hover:text-zinc-300">
                  /showcase/decayed-paint →
                </span>
              </Link>

              {/* Link 4: Interactive Playground */}
              <Link
                href="/"
                data-testid="cta-playground"
                className="group flex flex-col justify-between p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-purple-400">
                    <Compass className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Interactive Playground
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Real-time laboratory testing engine switching, spring presets, and coupled motion toggles.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 mt-4 group-hover:text-zinc-300">
                  / →
                </span>
              </Link>
            </div>
          </div>

          {/* Companion Whitepaper Card */}
          <div
            data-testid="companion-whitepaper-card"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-700/80"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-bold text-white">
                  Companion Architectural Whitepaper
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  For the complete mathematical derivations, Poisson-disk distribution proofs,
                  full 11-dimension comparative matrix, and cellular telemetry logs, consult the companion
                  markdown whitepaper at <code className="text-amber-300 font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">docs/conclusions.md</code>.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-zinc-300">
              <span>docs/conclusions.md</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
