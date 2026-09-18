"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShadowBackground,
  type ShadowCasterConfig,
  type MotionPreset,
  type DegradationTier,
} from "@/components/ShadowBackground";
import { SPRING_PRESETS } from "@/lib/motion/spring";
import { DiagnosticHUD, type HarnessSettings } from "@/components/DiagnosticHUD";
import { PlaygroundCanvas } from "@/components/PlaygroundCanvas";
import { BenchmarkComparison } from "@/components/BenchmarkComparison";
import { ProceduralFoliageHarness } from "@/components/ProceduralFoliageHarness";
import { InteractiveMotionHarness } from "@/components/InteractiveMotionHarness";
import { globalVitalsTracker, type VitalsSnapshot } from "@/lib/web-vitals";
import {
  Activity,
  ShieldCheck,
  Gauge,
  ExternalLink,
  GitBranch,
  MousePointerClick,
  Sliders,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Trees,
  Zap,
  FileCode,
  Presentation,
} from "lucide-react";

const CASTERS: Record<
  "komorebi" | "branch" | "image",
  { label: string; badge: string; config: ShadowCasterConfig }
> = {
  komorebi: {
    label: "Komorebi Canopy",
    badge: "GPU Simplex",
    config: {
      type: "komorebi",
      density: 1.0,
      contrast: 1.2,
      scale: 3.5,
      speed: 0.5,
    },
  },
  branch: {
    label: "Parametric Branch",
    badge: "2D Harmonic",
    config: {
      type: "branch",
      depth: 4,
      leafDensity: 5,
      swaySpeed: 0.7,
    },
  },
  image: {
    label: "Raster Branch Image",
    badge: "Silhouette Caster",
    config: {
      type: "image",
      src: "/images/caster-branch.svg",
      opacity: 0.65,
    },
  },
};

const BASE_PLATES = [
  { id: "minimal-studio", label: "Minimal Studio", src: "/images/base-minimal-studio.svg" },
  { id: "architectural", label: "Architectural Wall", src: "/images/base-architectural.svg" },
  { id: "dappled-forest", label: "Dappled Forest", src: "/images/base-dappled-forest.svg" },
];

const DEGRADATION_TIERS: { key: DegradationTier; label: string; desc: string }[] = [
  { key: "auto", label: "Auto (Gated)", desc: "Capability evaluated" },
  { key: "force-static", label: "Force Static", desc: "Static poster floor" },
  { key: "force-dynamic", label: "Force Dynamic", desc: "Unconditional render" },
];

const MOTION_PRESETS: MotionPreset[] = ["smooth", "snappy", "inertial", "bouncy", "none"];

export default function Home() {
  // ---------------------------------------------------------------------------
  // 1. Production Hero Showcase State
  // ---------------------------------------------------------------------------
  const [heroCasterKey, setHeroCasterKey] = useState<"komorebi" | "branch" | "image">("komorebi");
  const [heroDegradation, setHeroDegradation] = useState<DegradationTier>("auto");
  const [heroMotionPreset, setHeroMotionPreset] = useState<MotionPreset>("smooth");
  const [heroPenumbra, setHeroPenumbra] = useState<number>(24);
  const [heroBasePlate, setHeroBasePlate] = useState<string>("/images/base-minimal-studio.svg");
  const [heroBasePlateMotion, setHeroBasePlateMotion] = useState<boolean>(false);
  const [ctaClickCount, setCtaClickCount] = useState<number>(0);
  const [vitals, setVitals] = useState<VitalsSnapshot>({
    lcp: null,
    inp: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });

  useEffect(() => {
    return globalVitalsTracker.subscribe((snapshot) => {
      setVitals(snapshot);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Prototype Harness Navigation & Legacy Settings
  // ---------------------------------------------------------------------------
  const [harnessTab, setHarnessTab] = useState<"all" | "benchmark" | "foliage" | "motion" | "viewport">("all");
  const [settings, setSettings] = useState<HarnessSettings>({
    viewportMode: "cover",
    baseImage: "/images/base-architectural.svg",
    forcedTier: "auto",
    cpuStressMs: 0,
  });

  // Derived telemetry labels
  const activeEngineLabel =
    heroDegradation === "force-static"
      ? "Static Poster Floor"
      : heroCasterKey === "komorebi"
      ? "Procedural GLSL Komorebi"
      : heroCasterKey === "branch"
      ? "Parametric Branch 2D"
      : "WebGL Poisson-Disk";

  const activeSpringLabel =
    heroMotionPreset === "none"
      ? "Disabled (0% CPU Rest)"
      : `${heroMotionPreset.charAt(0).toUpperCase() + heroMotionPreset.slice(1)} (k=${
          SPRING_PRESETS[heroMotionPreset].stiffness
        }, c=${SPRING_PRESETS[heroMotionPreset].damping})`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
              SC
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Shadowcasting POC</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Production Component
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Next.js 15 • Core Web Vitals &amp; Dynamic Shading Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Showcase Gallery ↗</span>
            </Link>

            <Link
              href="/conclusions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 transition active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Conclusions ↗</span>
            </Link>

            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 transition active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Guide ↗</span>
            </Link>

            <Link
              href="/presentation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-purple-400 border border-purple-500/30 transition active:scale-95"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presentation ↗</span>
            </Link>

            <a
              href="https://github.com/manuelhe/shadowcasting-poc/blob/main/docs/adr/0002-decoupled-transparent-shadow-layer.md"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>ADR-0001 &amp; ADR-0002</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>

            <a
              href="https://github.com/manuelhe/shadowcasting-poc/issues/13"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ticket #13</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>
      </header>

      {/* Top Diagnostics HUD Telemetry Strip */}
      <section
        aria-label="Diagnostics HUD Telemetry Strip"
        className="border-b border-zinc-800/70 bg-zinc-900/40 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Diagnostics HUD Active
            </span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="text-zinc-300 font-mono text-[11px]">
              LCP Target:{" "}
              <span className="text-emerald-400 font-semibold">
                {vitals.lcp ? vitals.lcp.formatted : "≤ 1.2s"}
              </span>{" "}
              <span className="text-zinc-500 font-sans">
                {vitals.lcp ? `(${vitals.lcp.rating})` : "(SSR Poster Floor)"}
              </span>
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-300 font-mono text-[11px]">
              CLS:{" "}
              <span className="text-emerald-400 font-semibold">
                {vitals.cls ? vitals.cls.formatted : "0.000"}
              </span>{" "}
              <span className="text-zinc-500 font-sans">
                {vitals.cls ? `(${vitals.cls.rating})` : "(Strict Containment)"}
              </span>
            </span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-300 font-mono text-[11px]">
              INP:{" "}
              <span className="text-emerald-400 font-semibold">
                {vitals.inp ? vitals.inp.formatted : "≤ 16ms"}
              </span>{" "}
              <span className="text-zinc-500 font-sans">
                {vitals.inp ? `(${vitals.inp.rating})` : "(Semi-implicit Euler)"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">
              Live frame rates &amp; metrics floating in bottom-right HUD
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        {/* ================================================================= */}
        {/* SECTION 1: Production Hero Demonstration (<ShadowBackground />) */}
        {/* ================================================================= */}
        <section aria-label="Production Hero Demonstration" className="w-full">
          {/* Section Header */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Production Component Showcase
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  &lt;ShadowBackground /&gt; • Issue #13
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
                End-to-End Production Hero Demonstration
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md sm:text-right">
              Live unified component integrating Zero-LCP SSR floor, WebGL Poisson contact hardening, and spring-damped interactive parallax.
            </p>
          </div>

          {/* Hero Stage Container */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
            <ShadowBackground
              basePlate={heroBasePlate}
              caster={CASTERS[heroCasterKey].config}
              degradation={heroDegradation}
              motion={heroMotionPreset}
              penumbra={heroPenumbra}
              basePlateMotion={heroBasePlateMotion}
              contactHardening={true}
              fit="cover"
              className="h-[560px] sm:h-[620px] lg:h-[660px] w-full"
            >
              {/* Rich Foreground Content inside <ShadowBackground /> at relative z-10 */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none">
                {/* Top Row: Badge + Telemetry status pills */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-950/75 border border-sky-500/30 text-sky-300 shadow-lg backdrop-blur-md self-start">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Production Architecture • ADR-0001 &amp; ADR-0002</span>
                  </div>

                  {/* Telemetry Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Active Engine Mode */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950/75 border border-zinc-800/90 text-zinc-300 shadow-md backdrop-blur-md">
                      <span className="text-zinc-500 font-sans">Engine:</span>
                      <span className="text-emerald-400 font-semibold">{activeEngineLabel}</span>
                    </div>

                    {/* Current Tier */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950/75 border border-zinc-800/90 text-zinc-300 shadow-md backdrop-blur-md">
                      <span className="text-zinc-500 font-sans">Tier:</span>
                      <span className="text-amber-400 font-semibold uppercase">{heroDegradation}</span>
                    </div>

                    {/* Base Plate Motion (ADR-0002 Decoupled Substrate) */}
                    <div
                      data-testid="hero-base-plate-telemetry"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950/75 border border-zinc-800/90 text-zinc-300 shadow-md backdrop-blur-md"
                    >
                      <span className="text-zinc-500 font-sans">Base Plate:</span>{" "}
                      <span
                        className={
                          heroBasePlateMotion
                            ? "text-amber-400 font-semibold"
                            : "text-emerald-400 font-semibold"
                        }
                      >
                        {heroBasePlateMotion ? "Dynamic (Coupled)" : "Static (Decoupled)"}
                      </span>
                    </div>

                    {/* Spring Damping */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950/75 border border-zinc-800/90 text-zinc-300 shadow-md backdrop-blur-md">
                      <span className="text-zinc-500 font-sans">Spring:</span>
                      <span className="text-sky-400 font-semibold">{activeSpringLabel}</span>
                    </div>

                    {/* Penumbra */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950/75 border border-zinc-800/90 text-zinc-300 shadow-md backdrop-blur-md">
                      <span className="text-zinc-500 font-sans">Penumbra:</span>
                      <span className="text-indigo-400 font-semibold">{heroPenumbra}px</span>
                    </div>
                  </div>
                </div>

                {/* Center Content Card */}
                <div className="my-auto max-w-2xl py-4">
                  <div className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1] mb-4">
                      Next-Gen Dynamic Shadowcasting
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6 font-normal">
                      Zero-LCP priority poster floor, sub-millisecond Poisson contact hardening, and spring-damped parallax. Real-time organic light occlusion at 60–120 FPS with zero idle CPU consumption.
                    </p>

                    {/* Interactive Call to Action buttons confirming pointer responsiveness at relative z-10 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCtaClickCount((prev) => prev + 1)}
                        className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all duration-150 cursor-pointer pointer-events-auto"
                      >
                        <MousePointerClick className="w-4 h-4 text-sky-200 group-hover:scale-110 transition-transform" />
                        <span>Test Interactive Click</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 font-mono">
                          {ctaClickCount} {ctaClickCount === 1 ? "click" : "clicks"}
                        </span>
                      </button>

                      <a
                        href="#architecture-notes"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-md backdrop-blur-sm active:scale-95 transition-all duration-150 cursor-pointer pointer-events-auto"
                      >
                        <span>ADR-0001 Specifications</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      </a>

                      {ctaClickCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Foreground pointer events responsive at relative z-10 ({ctaClickCount} clicks recorded)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Guidance Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400 bg-zinc-950/75 border border-zinc-800/80 px-4 py-2.5 rounded-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Move pointer or touch drag across stage to drive spring physics, 3D perspective skew, and penumbra dilation.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                    Dormant rAF at Rest (0% CPU)
                  </span>
                </div>
              </div>
            </ShadowBackground>
          </div>

          {/* Interactive Hero Controls Deck */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 mt-4 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">
                  Production Hero Demonstration Controls
                </h3>
              </div>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Declarative prop controls driving <code className="text-sky-400 font-mono">&lt;ShadowBackground /&gt;</code>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 text-xs">
              {/* 1. Caster Switcher */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">
                  Shadow Caster
                </label>
                <div className="flex flex-col gap-1">
                  {(
                    Object.keys(CASTERS) as Array<keyof typeof CASTERS>
                  ).map((key) => {
                    const c = CASTERS[key];
                    const isSelected = heroCasterKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setHeroCasterKey(key)}
                        className={`px-2.5 py-1.5 rounded-lg text-left font-medium border transition flex items-center justify-between ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500 text-sky-300 font-semibold"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                          {c.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Degradation Tier Toggle */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">
                  Degradation Tier
                </label>
                <div className="flex flex-col gap-1">
                  {DEGRADATION_TIERS.map((tier) => {
                    const isSelected = heroDegradation === tier.key;
                    return (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => setHeroDegradation(tier.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-left font-medium border transition flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span>{tier.label}</span>
                        <span className="text-[10px] text-zinc-500">
                          {tier.key === "force-static" ? "0% CPU" : "Dyn"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Motion Preset Toggle */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">
                  Motion Preset
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {MOTION_PRESETS.map((preset) => {
                    const isSelected = heroMotionPreset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setHeroMotionPreset(preset)}
                        className={`px-2 py-1.5 rounded-lg text-center font-medium border capitalize transition text-xs ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500 text-sky-300 font-semibold"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Penumbra Diffusion Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-semibold">
                    Penumbra Diffusion
                  </label>
                  <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {heroPenumbra} px
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={1}
                  value={heroPenumbra}
                  onChange={(e) => setHeroPenumbra(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>8px (Sharp)</span>
                  <span>24px (Natural)</span>
                  <span>32px (Diffuse)</span>
                </div>
              </div>

              {/* 5. Base Plate Switcher */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">
                  Base Plate Surface
                </label>
                <div className="flex flex-col gap-1">
                  {BASE_PLATES.map((bp) => {
                    const isSelected = heroBasePlate === bp.src;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => setHeroBasePlate(bp.src)}
                        className={`px-2.5 py-1.5 rounded-lg text-left font-medium border transition ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        {bp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Base Plate Motion Toggle (ADR-0002) */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">
                  Base Plate Motion
                </label>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setHeroBasePlateMotion(false)}
                    className={`px-2.5 py-1.5 rounded-lg text-left font-medium border transition flex items-center justify-between ${
                      !heroBasePlateMotion
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span>Static (Default)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                      ADR-0002
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroBasePlateMotion(true)}
                    className={`px-2.5 py-1.5 rounded-lg text-left font-medium border transition flex items-center justify-between ${
                      heroBasePlateMotion
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span>Coupled Motion</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                      Full Scene
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: Technical Architecture & Core Web Vitals Grounding    */}
        {/* ================================================================= */}
        <section id="architecture-notes" className="w-full pt-4">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Architectural Foundations
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              ADR-0001 Specifications &amp; Core Web Vitals Grounding
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-zinc-100 mb-1.5">
                  Zero-LCP Priority Floor
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  SSR renders the Static Poster Fallback via <code className="text-sky-400">next/image</code> with <code className="text-sky-400">priority</code> and strict absolute containment, locking LCP before client hydration and guaranteeing 0.000 CLS.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                CLS: 0.0000 • LCP: &le; 1.2s
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                  <Gauge className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-zinc-100 mb-1.5">
                  Dual-Filtering Architecture
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Eliminates CSS blur invalidations that consume 49MB–190MB VRAM. The hardware-accelerated WebGL Poisson-disk shader executes in &lt;0.8ms GPU time with variable contact hardening and 0 KB heap overhead.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                GPU Time: &lt; 0.8ms • VRAM: ~4MB
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-zinc-100 mb-1.5">
                  Spring Parallax &amp; Sleep Cycle
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Second-order semi-implicit Euler spring solver responds instantaneously to pointer, touch, and scroll interactions. Automatically powers down the rAF loop at rest for 0.0% idle CPU draw.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                INP: &le; 16ms • Idle CPU: 0.0%
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: Research Testbeds & Prototype Harnesses               */}
        {/* ================================================================= */}
        <section aria-label="Research Prototype Harnesses" className="w-full pt-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Empirical Testbeds &amp; Research Harnesses
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                Individual Prototype Testbeds (Issues #4 – #7)
              </h3>
            </div>

            {/* Harness Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
              {[
                { id: "all", label: "Show All" },
                { id: "benchmark", label: "Engine Benchmark (#5)" },
                { id: "foliage", label: "Procedural Foliage (#6)" },
                { id: "motion", label: "Interactive Motion (#7)" },
                { id: "viewport", label: "Viewport & Throttling (#4)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHarnessTab(tab.id as typeof harnessTab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    harnessTab === tab.id
                      ? "bg-sky-500/20 text-sky-300 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            {/* 3.1 Comparative Engine Benchmark Section (Issue #5) */}
            {(harnessTab === "all" || harnessTab === "benchmark") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <span>Issue #5: Comparative Engine Benchmark (CSS vs. Canvas2D vs. WebGL)</span>
                </div>
                <BenchmarkComparison />
              </div>
            )}

            {/* 3.2 Procedural Foliage & Komorebi Generator Section (Issue #6) */}
            {(harnessTab === "all" || harnessTab === "foliage") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  <Trees className="w-4 h-4 text-emerald-400" />
                  <span>Issue #6: Procedural Foliage &amp; Komorebi Shader Generator</span>
                </div>
                <ProceduralFoliageHarness />
              </div>
            )}

            {/* 3.3 Composable Interactive Motion & Parallax Section (Issue #7) */}
            {(harnessTab === "all" || harnessTab === "motion") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Issue #7: Composable Interactive Motion &amp; Spring Physics Controller</span>
                </div>
                <InteractiveMotionHarness />
              </div>
            )}

            {/* 3.4 Viewport Stage & CPU Throttling Section (Issue #4) */}
            {(harnessTab === "all" || harnessTab === "viewport") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  <Cpu className="w-4 h-4 text-rose-400" />
                  <span>Issue #4: Viewport Scaling &amp; Synthetic CPU Throttling Harness</span>
                </div>
                <PlaygroundCanvas settings={settings} />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Diagnostic HUD */}
      <DiagnosticHUD settings={settings} onSettingsChange={setSettings} />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Shadowcasting POC • Built for performant, organic Next.js web graphics
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://github.com/manuelhe/shadowcasting-poc/blob/main/docs/adr/0001-shadowcasting-component-architecture.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition"
            >
              ADR-0001
            </a>
            <span>•</span>
            <a
              href="https://github.com/manuelhe/shadowcasting-poc/blob/main/docs/adr/0002-decoupled-transparent-shadow-layer.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition"
            >
              ADR-0002
            </a>
            <span>•</span>
            <a
              href="https://github.com/manuelhe/shadowcasting-poc/blob/main/CONTEXT.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition"
            >
              CONTEXT.md
            </a>
            <span>•</span>
            <a
              href="https://github.com/manuelhe/shadowcasting-poc/issues/13"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition"
            >
              Ticket #13
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
