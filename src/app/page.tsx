"use client";

import React, { useState } from "react";
import { DiagnosticHUD, HarnessSettings } from "@/components/DiagnosticHUD";
import { PlaygroundCanvas } from "@/components/PlaygroundCanvas";
import { BenchmarkComparison } from "@/components/BenchmarkComparison";
import { ProceduralFoliageHarness } from "@/components/ProceduralFoliageHarness";
import { Activity, ShieldCheck, Gauge, ExternalLink, GitBranch } from "lucide-react";

export default function Home() {
  const [settings, setSettings] = useState<HarnessSettings>({
    viewportMode: "cover",
    baseImage: "/images/base-architectural.svg",
    forcedTier: "auto",
    cpuStressMs: 0,
  });

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
              <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                Shadowcasting POC
              </h1>
              <p className="text-[11px] text-zinc-400">
                Next.js 15 • Core Web Vitals Test Harness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/manuelhe/shadowcasting-poc/issues/1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-sky-400" />
              <span>Wayfinder Map #1</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Intro Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive Harness Active
            </span>
            <span className="text-xs text-zinc-500">
              Evaluating Zero-LCP Degradation &amp; Frame Latency
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Real-Time Shadowcasting Playground &amp; CWV Monitor
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl mt-1 leading-relaxed">
            Test shadow projection performance across viewport scaling modes, ambient sway oscillation, cursor/touch parallax, and synthetic CPU throttling. Inspect live frame rates and Core Web Vitals in the bottom-right Diagnostic HUD.
          </p>
        </div>

        {/* The Viewport Stage */}
        <section aria-label="Shadow Stage" className="w-full">
          <PlaygroundCanvas settings={settings} />
        </section>

        {/* Comparative Engine Benchmark Section (Issue #5) */}
        <section aria-label="Engine Benchmark" className="w-full mt-6">
          <BenchmarkComparison />
        </section>

        {/* Procedural Foliage & Komorebi Generator Section (Issue #6) */}
        <section aria-label="Procedural Foliage" className="w-full mt-6">
          <ProceduralFoliageHarness />
        </section>

        {/* Technical Architecture Notes & Research Grounding */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
              Zero-LCP Fallback
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              SSR renders the Base Plate via <code className="text-sky-400">next/image</code> with <code className="text-sky-400">priority</code> and absolute containment, guaranteeing 0.000 CLS and instantaneous LCP candidate attribution before hydration.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
              Dual-Filtering Architecture
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Research (#2) proves CSS blur forces 49MB rasterization re-allocations on ambient motion. The WebGL Dual Kawase pipeline slashes GPU fill-rate by 75–93%, avoiding mobile TBDR thermal throttling.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
              Core Web Vitals Telemetry
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrated with Google’s <code className="text-sky-400">web-vitals</code> library tracking live LCP, INP, and CLS alongside high-frequency rAF frame render times and frame-drop detection.
            </p>
          </div>
        </section>
      </main>

      {/* Floating Diagnostic HUD */}
      <DiagnosticHUD settings={settings} onSettingsChange={setSettings} />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>Shadowcasting POC Playground • Built for performant, organic web graphics</p>
      </footer>
    </div>
  );
}
