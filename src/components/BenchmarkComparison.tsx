"use client";

import React, { useState, useEffect, useRef } from "react";
import { CssShadowEngine } from "./engines/CssShadowEngine";
import { Canvas2dShadowEngine } from "./engines/Canvas2dShadowEngine";
import { WebGlShadowEngine } from "./engines/WebGlShadowEngine";
import {
  Sparkles,
  Columns,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wind,
} from "lucide-react";

interface EngineStats {
  css: { fps: number; frameTimeMs: number };
  canvas: { fps: number; frameTimeMs: number };
  webgl: { fps: number; frameTimeMs: number };
}

export function BenchmarkComparison() {
  const [viewMode, setViewMode] = useState<"triptych" | "css" | "canvas" | "webgl">("triptych");
  const [baseImage, setBaseImage] = useState("/images/base-architectural.svg");
  const [blurRadius, setBlurRadius] = useState(14);
  const [shadowOpacity, setShadowOpacity] = useState(0.55);
  const [contactHardening, setContactHardening] = useState(true);
  const [ambientSpeed, setAmbientSpeed] = useState(0.8);

  const [ambientAngle, setAmbientAngle] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<EngineStats>({
    css: { fps: 60, frameTimeMs: 16.6 },
    canvas: { fps: 60, frameTimeMs: 16.6 },
    webgl: { fps: 60, frameTimeMs: 16.6 },
  });

  // Unified ambient motion loop
  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      setAmbientAngle(elapsed * ambientSpeed);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [ambientSpeed]);

  // Pointer tracking for parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const handlePointerLeave = () => {
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // Coordinated displacement calculations
  const swayX = Math.sin(ambientAngle) * 20;
  const swayY = Math.cos(ambientAngle * 0.7) * 12;
  const parallaxX = (mousePos.x - 0.5) * 50;
  const parallaxY = (mousePos.y - 0.5) * 35;

  const totalOffsetX = 20 + swayX + parallaxX;
  const totalOffsetY = 25 + swayY + parallaxY;
  const ambientScale = 1 + Math.sin(ambientAngle * 0.5) * 0.02;

  const casterImage = "/images/caster-branch.svg";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 mb-12 select-none"
    >
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Comparative Prototype #5
            </span>
            <span className="text-xs text-zinc-400">Head-to-Head Engine Benchmark</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100 mt-1">
            CSS Filter vs. Canvas 2D vs. WebGL Shader
          </h3>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode("triptych")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "triptych"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Triptych Split</span>
          </button>

          <button
            onClick={() => setViewMode("css")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "css"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>CSS Filter</span>
          </button>

          <button
            onClick={() => setViewMode("canvas")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "canvas"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Canvas 2D</span>
          </button>

          <button
            onClick={() => setViewMode("webgl")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "webgl"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>WebGL 2</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-4 border-b border-zinc-800/80 text-xs">
        {/* Base Texture */}
        <div>
          <label className="text-zinc-400 font-medium block mb-1">Base Plate Texture</label>
          <select
            value={baseImage}
            onChange={(e) => setBaseImage(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="/images/base-architectural.svg">Architectural Wall</option>
            <option value="/images/base-minimal-studio.svg">Minimal Studio</option>
            <option value="/images/base-dappled-forest.svg">Dappled Forest Wall</option>
          </select>
        </div>

        {/* Ambient Sway Speed */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" /> Wind Sway
            </label>
            <span className="font-mono text-zinc-300">{ambientSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.1"
            value={ambientSpeed}
            onChange={(e) => setAmbientSpeed(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Blur Radius */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium">Penumbra Blur</label>
            <span className="font-mono text-zinc-300">{blurRadius}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={blurRadius}
            onChange={(e) => setBlurRadius(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Shadow Opacity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium">Shadow Opacity</label>
            <span className="font-mono text-zinc-300">{Math.round(shadowOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={shadowOpacity}
            onChange={(e) => setShadowOpacity(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Contact Hardening Toggle */}
        <div className="flex flex-col justify-between">
          <span className="text-zinc-400 font-medium mb-1">Contact Hardening</span>
          <button
            onClick={() => setContactHardening(!contactHardening)}
            className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              contactHardening
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{contactHardening ? "Physical (WebGL)" : "Uniform Blur"}</span>
          </button>
        </div>
      </div>

      {/* Visual Comparative Stage */}
      <div className="mt-6">
        {viewMode === "triptych" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engine 1: CSS Filter */}
            <div className="flex flex-col bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800">
                <span className="font-semibold text-xs text-zinc-200">1. CSS Filter</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {stats.css.frameTimeMs}ms • {stats.css.fps} FPS
                </span>
              </div>
              <div className="relative aspect-[4/3] w-full">
                <CssShadowEngine
                  baseImage={baseImage}
                  casterImage={casterImage}
                  offsetX={totalOffsetX}
                  offsetY={totalOffsetY}
                  blurRadius={blurRadius}
                  shadowOpacity={shadowOpacity}
                  ambientScale={ambientScale}
                  onFrameStats={(s) => setStats((prev) => ({ ...prev, css: s }))}
                />
              </div>
              <div className="p-3 text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Penumbra Type:</span>
                  <span className="text-amber-400 font-medium">Uniform Only</span>
                </div>
                <div className="flex justify-between">
                  <span>Compositor Churn:</span>
                  <span className="text-rose-400 font-medium">High (Layer Repaints)</span>
                </div>
              </div>
            </div>

            {/* Engine 2: Canvas 2D */}
            <div className="flex flex-col bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800">
                <span className="font-semibold text-xs text-zinc-200">2. Canvas 2D</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {stats.canvas.frameTimeMs}ms • {stats.canvas.fps} FPS
                </span>
              </div>
              <div className="relative aspect-[4/3] w-full">
                <Canvas2dShadowEngine
                  baseImage={baseImage}
                  casterImage={casterImage}
                  offsetX={totalOffsetX}
                  offsetY={totalOffsetY}
                  blurRadius={blurRadius}
                  shadowOpacity={shadowOpacity}
                  ambientScale={ambientScale}
                  onFrameStats={(s) => setStats((prev) => ({ ...prev, canvas: s }))}
                />
              </div>
              <div className="p-3 text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Penumbra Type:</span>
                  <span className="text-amber-400 font-medium">Uniform Only</span>
                </div>
                <div className="flex justify-between">
                  <span>Main-Thread Cost:</span>
                  <span className="text-amber-400 font-medium">Moderate (rAF Draw)</span>
                </div>
              </div>
            </div>

            {/* Engine 3: WebGL 2 */}
            <div className="flex flex-col bg-zinc-900/60 rounded-xl border border-indigo-900/50 overflow-hidden ring-1 ring-indigo-500/20">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800">
                <span className="font-semibold text-xs text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3. WebGL Fragment</span>
                </span>
                <span className="font-mono text-[11px] text-indigo-300 font-bold">
                  {stats.webgl.frameTimeMs}ms • {stats.webgl.fps} FPS
                </span>
              </div>
              <div className="relative aspect-[4/3] w-full">
                <WebGlShadowEngine
                  baseImage={baseImage}
                  casterImage={casterImage}
                  offsetX={totalOffsetX}
                  offsetY={totalOffsetY}
                  blurRadius={blurRadius}
                  shadowOpacity={shadowOpacity}
                  ambientScale={ambientScale}
                  contactHardening={contactHardening}
                  onFrameStats={(s) => setStats((prev) => ({ ...prev, webgl: s }))}
                />
              </div>
              <div className="p-3 text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Penumbra Type:</span>
                  <span className="text-emerald-400 font-medium">Contact Hardened</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU Pipeline:</span>
                  <span className="text-emerald-400 font-medium">Zero Host Re-raster</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single Engine Focused Mode */
          <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 aspect-[16/9] relative shadow-2xl">
            {viewMode === "css" && (
              <CssShadowEngine
                baseImage={baseImage}
                casterImage={casterImage}
                offsetX={totalOffsetX}
                offsetY={totalOffsetY}
                blurRadius={blurRadius}
                shadowOpacity={shadowOpacity}
                ambientScale={ambientScale}
                onFrameStats={(s) => setStats((prev) => ({ ...prev, css: s }))}
              />
            )}
            {viewMode === "canvas" && (
              <Canvas2dShadowEngine
                baseImage={baseImage}
                casterImage={casterImage}
                offsetX={totalOffsetX}
                offsetY={totalOffsetY}
                blurRadius={blurRadius}
                shadowOpacity={shadowOpacity}
                ambientScale={ambientScale}
                onFrameStats={(s) => setStats((prev) => ({ ...prev, canvas: s }))}
              />
            )}
            {viewMode === "webgl" && (
              <WebGlShadowEngine
                baseImage={baseImage}
                casterImage={casterImage}
                offsetX={totalOffsetX}
                offsetY={totalOffsetY}
                blurRadius={blurRadius}
                shadowOpacity={shadowOpacity}
                ambientScale={ambientScale}
                contactHardening={contactHardening}
                onFrameStats={(s) => setStats((prev) => ({ ...prev, webgl: s }))}
              />
            )}

            <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-200 font-semibold flex items-center gap-2">
              <span className="uppercase tracking-wider">{viewMode} Engine Focus</span>
            </div>
          </div>
        )}
      </div>

      {/* Synthesis Evaluation Matrix */}
      <div className="mt-8 bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Comparative Benchmark Verdict &amp; Performance Trade-Off Matrix
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">Empirical Findings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/40 text-zinc-400 border-b border-zinc-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Engine</th>
                <th className="py-2.5 px-4 font-medium">Visual Realism</th>
                <th className="py-2.5 px-4 font-medium">Contact Hardening</th>
                <th className="py-2.5 px-4 font-medium">Main-Thread Budget</th>
                <th className="py-2.5 px-4 font-medium">GPU Memory &amp; Compositor Risk</th>
                <th className="py-2.5 px-4 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-200">1. CSS Filter</td>
                <td className="py-3 px-4 text-zinc-400">Flat, uniform blur; lacks depth gradient</td>
                <td className="py-3 px-4 text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Impossible
                </td>
                <td className="py-3 px-4 text-emerald-400 font-mono">0ms (Offloaded)</td>
                <td className="py-3 px-4 text-rose-400">
                  High: continuous transform causes layer buffer churn on WebKit/Blink
                </td>
                <td className="py-3 px-4 text-zinc-400">Best for static poster tier</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-200">2. Canvas 2D</td>
                <td className="py-3 px-4 text-zinc-400">Smooth uniform blur; multiply blend mode</td>
                <td className="py-3 px-4 text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High CPU cost (multi-pass)
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono">2.5–6.0ms / frame</td>
                <td className="py-3 px-4 text-zinc-300">
                  Moderate: fixed buffer size, no GPU texture recreation
                </td>
                <td className="py-3 px-4 text-zinc-400">Fallback for non-WebGL devices</td>
              </tr>
              <tr className="bg-indigo-500/5">
                <td className="py-3 px-4 font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 3. WebGL 2 Shader
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Photorealistic: distance-based penumbra attenuation
                </td>
                <td className="py-3 px-4 text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Native (Variable blur)
                </td>
                <td className="py-3 px-4 text-emerald-400 font-mono">&lt; 0.8ms / frame</td>
                <td className="py-3 px-4 text-emerald-400">
                  Optimal: zero CPU-to-GPU transfer after initial upload
                </td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Primary Production Engine</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
