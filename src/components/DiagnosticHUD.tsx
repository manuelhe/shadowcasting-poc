"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { globalFpsTracker, FrameMetrics } from "@/lib/fps-tracker";
import { globalVitalsTracker, VitalsSnapshot } from "@/lib/web-vitals";
import {
  getCachedDeviceCapabilities,
  subscribeDeviceCapabilities,
  DeviceCapabilities,
  DegradationTier,
} from "@/lib/device-capabilities";
import { globalCpuStress } from "@/lib/cpu-stress";
import {
  Activity,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";

export interface HarnessSettings {
  viewportMode: "cover" | "16:9" | "fixed-banner" | "mobile";
  baseImage: string;
  forcedTier: DegradationTier | "auto";
  cpuStressMs: number;
}

interface DiagnosticHUDProps {
  settings: HarnessSettings;
  onSettingsChange: (newSettings: HarnessSettings) => void;
}

export function DiagnosticHUD({ settings, onSettingsChange }: DiagnosticHUDProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"performance" | "capabilities" | "controls">("performance");
  const [fpsMetrics, setFpsMetrics] = useState<FrameMetrics>({
    fps: 60,
    frameTimeMs: 16.6,
    minFrameTimeMs: 16.6,
    maxFrameTimeMs: 16.6,
    droppedFramesCount: 0,
    history: [],
  });
  const [vitals, setVitals] = useState<VitalsSnapshot>({
    lcp: null,
    inp: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });

  const deviceCaps = useSyncExternalStore<DeviceCapabilities | null>(
    subscribeDeviceCapabilities,
    getCachedDeviceCapabilities,
    () => null
  );

  useEffect(() => {
    // Subscribe to FPS
    const unsubFps = globalFpsTracker.subscribe((metrics) => {
      setFpsMetrics(metrics);
    });

    // Subscribe to Web Vitals
    const unsubVitals = globalVitalsTracker.subscribe((v) => {
      setVitals(v);
    });

    return () => {
      unsubFps();
      unsubVitals();
    };
  }, []);

  const handleCpuStressChange = (ms: number) => {
    globalCpuStress.setStress(ms);
    onSettingsChange({ ...settings, cpuStressMs: ms });
  };

  const handleReset = () => {
    globalFpsTracker.reset();
    globalVitalsTracker.reset();
  };

  const getRatingBadge = (rating?: "good" | "needs-improvement" | "poor") => {
    if (!rating) return <span className="text-zinc-500 text-xs">Waiting...</span>;
    if (rating === "good") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" /> Good
        </span>
      );
    }
    if (rating === "needs-improvement") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Needs Imp.
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3" /> Poor
      </span>
    );
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return "text-emerald-500";
    if (fps >= 30) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <aside
      aria-label="Core Web Vitals Diagnostic HUD"
      className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-zinc-900/90 text-zinc-100 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-sans transition-all text-xs"
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wide text-zinc-200">
            Diagnostics HUD
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            CWV &amp; FPS
          </span>
        </div>

        {/* Live Mini Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono">
            <span className="text-zinc-400 text-[11px]">FPS:</span>
            <span className={`font-bold ${getFpsColor(fpsMetrics.fps)}`}>
              {fpsMetrics.fps}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <span className="text-zinc-400 text-[11px]">INP:</span>
            <span className="text-zinc-200 font-medium">
              {vitals.inp ? vitals.inp.formatted : "—"}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title={isOpen ? "Collapse HUD" : "Expand HUD"}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div>
          {/* Tabs Navigation */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/40 text-[11px]">
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 font-medium ${
                activeTab === "performance"
                  ? "border-sky-500 text-sky-400 bg-sky-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab("capabilities")}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 font-medium ${
                activeTab === "capabilities"
                  ? "border-sky-500 text-sky-400 bg-sky-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Device &amp; Tier</span>
            </button>

            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition border-b-2 font-medium ${
                activeTab === "controls"
                  ? "border-sky-500 text-sky-400 bg-sky-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Harness Controls</span>
            </button>
          </div>

          {/* Tab 1: Performance Metrics */}
          {activeTab === "performance" && (
            <div className="p-3.5 space-y-3">
              {/* Frame rate graph and telemetry */}
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-400 text-[11px] font-medium">Frame Render Time (rAF)</span>
                  <span className="font-mono text-zinc-300 text-[11px]">
                    {fpsMetrics.frameTimeMs} ms <span className="text-zinc-500">({fpsMetrics.fps} fps)</span>
                  </span>
                </div>

                {/* Sparkline */}
                <div className="h-8 flex items-end gap-[2px] bg-zinc-900/60 p-1 rounded overflow-hidden">
                  {fpsMetrics.history.slice(-40).map((time, idx) => {
                    const heightPercent = Math.min(100, Math.max(10, (time / 33.3) * 100));
                    const isDrop = time > 24;
                    return (
                      <div
                        key={idx}
                        style={{ height: `${heightPercent}%` }}
                        className={`flex-1 rounded-t-[1px] ${
                          isDrop ? "bg-rose-500" : "bg-sky-500/70"
                        }`}
                        title={`${Math.round(time * 10) / 10} ms`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[10px] text-zinc-500 font-mono">
                  <span>Min: {fpsMetrics.minFrameTimeMs}ms</span>
                  <span>Max: {fpsMetrics.maxFrameTimeMs}ms</span>
                  <span className={fpsMetrics.droppedFramesCount > 0 ? "text-amber-400" : ""}>
                    Drops: {fpsMetrics.droppedFramesCount}
                  </span>
                </div>
              </div>

              {/* Core Web Vitals Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* LCP */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300">LCP</span>
                    {getRatingBadge(vitals.lcp?.rating)}
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-zinc-100">
                    {vitals.lcp ? vitals.lcp.formatted : "Measuring..."}
                  </div>
                  <div className="text-[10px] text-zinc-500">Goal: ≤ 2.5s</div>
                </div>

                {/* INP */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300">INP</span>
                    {getRatingBadge(vitals.inp?.rating)}
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-zinc-100">
                    {vitals.inp ? vitals.inp.formatted : "Click page to record"}
                  </div>
                  <div className="text-[10px] text-zinc-500">Goal: ≤ 200ms</div>
                </div>

                {/* CLS */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300">CLS</span>
                    {getRatingBadge(vitals.cls?.rating)}
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-zinc-100">
                    {vitals.cls ? vitals.cls.formatted : "0.0000"}
                  </div>
                  <div className="text-[10px] text-zinc-500">Goal: ≤ 0.1</div>
                </div>

                {/* FCP */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300">FCP</span>
                    {getRatingBadge(vitals.fcp?.rating)}
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-zinc-100">
                    {vitals.fcp ? vitals.fcp.formatted : "Measuring..."}
                  </div>
                  <div className="text-[10px] text-zinc-500">Goal: ≤ 1.8s</div>
                </div>
              </div>

              {/* Attribution Notes */}
              {vitals.inp?.attribution && (
                <div className="text-[10px] text-zinc-400 bg-zinc-950/40 p-2 rounded border border-zinc-800/50">
                  <span className="text-zinc-500">Last interaction target:</span>{" "}
                  <code className="text-sky-400 font-mono">{vitals.inp.attribution}</code>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Metrics
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Device Capabilities & Degradation Tier */}
          {activeTab === "capabilities" && (
            <div className="p-3.5 space-y-3">
              {/* Degradation Tier Badge */}
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Recommended Tier:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      deviceCaps?.recommendedTier === "full-dynamic"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : deviceCaps?.recommendedTier === "low-dynamic"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {deviceCaps?.recommendedTier.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-zinc-400 space-y-1">
                  {deviceCaps?.reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-sky-400">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Specs Breakdown */}
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Logical Cores:</span>
                  <span className="font-mono text-zinc-200">
                    {deviceCaps?.cores}{" "}
                    {deviceCaps?.isCoreClamped && (
                      <span className="text-amber-400 text-[10px]" title="Apple WebKit clamps to 2 to prevent fingerprinting">
                        (WebKit clamped)
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Device RAM:</span>
                  <span className="font-mono text-zinc-200">
                    {deviceCaps?.deviceMemoryGb ? `${deviceCaps.deviceMemoryGb} GB` : "Not exposed"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">WebGL 2 Support:</span>
                  <span
                    className={`font-mono font-medium ${
                      deviceCaps?.hasWebGL2 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {deviceCaps?.hasWebGL2 ? "Hardware Accelerated" : "Not Available"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Reduced Motion:</span>
                  <span className="font-mono text-zinc-200">
                    {deviceCaps?.prefersReducedMotion ? "Enabled (Static Poster forced)" : "Disabled"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-400">Save Data Mode:</span>
                  <span className="font-mono text-zinc-200">
                    {deviceCaps?.saveData ? "Enabled (Static Poster forced)" : "Disabled"}
                  </span>
                </div>
              </div>

              {deviceCaps?.webGlRenderer && (
                <div className="text-[10px] text-zinc-500 bg-zinc-950/40 p-2 rounded border border-zinc-800/50">
                  <span className="text-zinc-400">GPU Renderer:</span>{" "}
                  <code className="text-zinc-300 font-mono break-all">{deviceCaps.webGlRenderer}</code>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Harness Controls */}
          {activeTab === "controls" && (
            <div className="p-3.5 space-y-3.5">
              {/* Viewport Presets */}
              <div>
                <label className="text-zinc-300 font-medium block mb-1.5">
                  Viewport Container Preset
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "cover", label: "Full Container (Cover)" },
                    { id: "16:9", label: "Hero 16:9 Aspect" },
                    { id: "fixed-banner", label: "Fixed Banner (800x400)" },
                    { id: "mobile", label: "Mobile (390x844)" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          viewportMode: mode.id as HarnessSettings["viewportMode"],
                        })
                      }
                      className={`py-1.5 px-2 rounded text-[11px] font-medium border text-left transition ${
                        settings.viewportMode === mode.id
                          ? "bg-sky-500/20 border-sky-500 text-sky-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Plate Selector */}
              <div>
                <label className="text-zinc-300 font-medium block mb-1.5">
                  Base Plate Texture
                </label>
                <select
                  value={settings.baseImage}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, baseImage: e.target.value })
                  }
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="/images/base-architectural.svg">Architectural Concrete Wall</option>
                  <option value="/images/base-minimal-studio.svg">Minimalist Studio Backdrop</option>
                  <option value="/images/base-dappled-forest.svg">Dappled Sunlight Forest Wall</option>
                </select>
              </div>

              {/* Forced Degradation Tier */}
              <div>
                <label className="text-zinc-300 font-medium block mb-1.5">
                  Tier Simulation Override
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "auto", label: "Auto" },
                    { id: "static-poster", label: "Poster" },
                    { id: "low-dynamic", label: "Low" },
                    { id: "full-dynamic", label: "Full" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          forcedTier: t.id as HarnessSettings["forcedTier"],
                        })
                      }
                      className={`py-1 px-1 rounded text-center text-[10px] font-medium border transition ${
                        settings.forcedTier === t.id
                          ? "bg-sky-500/20 border-sky-500 text-sky-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Synthetic CPU Stress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-300 font-medium">Synthetic CPU Stress Load</label>
                  <span className="font-mono text-zinc-400 text-[11px]">
                    {settings.cpuStressMs} ms / frame
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={settings.cpuStressMs}
                  onChange={(e) => handleCpuStressChange(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                  <span>0ms (Clean)</span>
                  <span>15ms (Mid-tier)</span>
                  <span>40ms (Heavily throttled)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
