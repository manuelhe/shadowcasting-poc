"use client";

import React, { useState, useRef } from "react";
import { WebGlShadowEngine } from "./engines/WebGlShadowEngine";
import { ProceduralKomorebiEngine } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./engines/ProceduralBranchEngine";
import { useMotionController } from "@/hooks/useMotionController";
import { SPRING_PRESETS, SpringConfig } from "@/lib/motion/spring";
import {
  Compass,
  Sliders,
  Move,
  Activity,
  Trees,
  Sun,
  Zap,
} from "lucide-react";

export function InteractiveMotionHarness() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Engine selection
  const [activeEngine, setActiveEngine] = useState<"webgl" | "komorebi" | "branch">("webgl");

  // Physics preset & bundled SpringConfig
  const [preset, setPreset] = useState<"snappy" | "smooth" | "inertial" | "bouncy">("smooth");
  const [springConfig, setSpringConfig] = useState<SpringConfig>(SPRING_PRESETS.smooth);

  // Interaction options
  const [maxDisplacement, setMaxDisplacement] = useState(48);
  const [lightElevation, setLightElevation] = useState(1.2);
  const [scrollInfluence, setScrollInfluence] = useState(30);
  const [ambientMotion, setAmbientMotion] = useState(true);

  // Base Plate
  const [basePlate, setBasePlate] = useState("/images/base-minimal-studio.svg");

  // Telemetry state
  const [engineFrameTime, setEngineFrameTime] = useState(0.08);
  const [engineFps, setEngineFps] = useState(60);

  // Motion controller hook
  const { output, handlers } = useMotionController({
    containerRef,
    springConfig,
    maxDisplacementPx: maxDisplacement,
    lightElevation,
    scrollInfluencePx: scrollInfluence,
    ambientMotion,
    ambientSpeed: 0.8,
    ambientStrength: 10,
  });

  const handlePresetChange = (name: "snappy" | "smooth" | "inertial" | "bouncy") => {
    setPreset(name);
    setSpringConfig(SPRING_PRESETS[name]);
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 mb-12 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Prototype Ticket #7
            </span>
            <span className="text-xs text-zinc-400">Interactive Motion &amp; Parallax Controller</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100 mt-1">
            Composable Interactive Motion &amp; Parallax Controller
          </h3>
        </div>

        {/* Engine Target Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveEngine("webgl")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeEngine === "webgl"
                ? "bg-sky-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>WebGL Caster</span>
          </button>

          <button
            onClick={() => setActiveEngine("komorebi")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeEngine === "komorebi"
                ? "bg-sky-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Komorebi Canopy</span>
          </button>

          <button
            onClick={() => setActiveEngine("branch")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeEngine === "branch"
                ? "bg-sky-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-emerald-300" />
            <span>Parametric Branch</span>
          </button>
        </div>
      </div>

      {/* Physics Preset Bar & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 py-4 border-b border-zinc-800/80 text-xs">
        {/* Base Plate Selector */}
        <div>
          <label className="text-zinc-400 font-medium block mb-1">Base Plate</label>
          <select
            value={basePlate}
            onChange={(e) => setBasePlate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-sky-500"
          >
            <option value="/images/base-minimal-studio.svg">Minimal Studio</option>
            <option value="/images/base-architectural.svg">Architectural Wall</option>
            <option value="/images/base-dappled-forest.svg">Dappled Forest Wall</option>
          </select>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="text-zinc-400 font-medium block mb-1">Spring Damping Preset</label>
          <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {(["snappy", "smooth", "inertial", "bouncy"] as const).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handlePresetChange(name)}
                className={`py-1 rounded text-[11px] font-medium capitalize transition ${
                  preset === name
                    ? "bg-sky-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Stiffness & Damping Sliders */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium">Stiffness / Damping</label>
            <span className="font-mono text-zinc-300">{springConfig.stiffness} / {springConfig.damping}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="range"
              min="40"
              max="350"
              step="10"
              value={springConfig.stiffness}
              onChange={(e) =>
                setSpringConfig((prev) => ({ ...prev, stiffness: Number(e.target.value) }))
              }
              className="w-full accent-sky-500 cursor-pointer"
              title="Stiffness"
            />
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={springConfig.damping}
              onChange={(e) =>
                setSpringConfig((prev) => ({ ...prev, damping: Number(e.target.value) }))
              }
              className="w-full accent-sky-500 cursor-pointer"
              title="Damping"
            />
          </div>
        </div>

        {/* Mass & Max Displacement */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium">Mass / Max Offset</label>
            <span className="font-mono text-zinc-300">{springConfig.mass.toFixed(1)}m / {maxDisplacement}px</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={springConfig.mass}
              onChange={(e) =>
                setSpringConfig((prev) => ({ ...prev, mass: Number(e.target.value) }))
              }
              className="w-full accent-sky-500 cursor-pointer"
              title="Mass"
            />
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={maxDisplacement}
              onChange={(e) => setMaxDisplacement(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
              title="Max Displacement"
            />
          </div>
        </div>

        {/* Scroll Influence */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-zinc-400 font-medium">Scroll Tilt Shift</label>
            <span className="font-mono text-zinc-300">{scrollInfluence}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={scrollInfluence}
            onChange={(e) => setScrollInfluence(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Light Elevation & Ambient Motion Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-zinc-400 font-medium">Elevation</label>
              <span className="font-mono text-zinc-300">{lightElevation.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={lightElevation}
              onChange={(e) => setLightElevation(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Ambient</label>
            <button
              type="button"
              onClick={() => setAmbientMotion(!ambientMotion)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                ambientMotion
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
              }`}
            >
              {ambientMotion ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Stage (Pointer & Touch Target with 3D Perspective Distortion) */}
      <div
        ref={containerRef}
        onPointerMove={handlers.onPointerMove}
        onPointerLeave={handlers.onPointerLeave}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
        onTouchCancel={handlers.onTouchCancel}
        style={{ touchAction: "none", perspective: 1200 }}
        className="mt-6 relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 cursor-crosshair group select-none"
      >
        {/* Render Layer with Applied Dynamic Perspective Skew */}
        <div
          className="w-full h-full transform-gpu transition-transform duration-75 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${output.skewY}deg) rotateY(${output.skewX}deg)`,
          }}
        >
          {activeEngine === "webgl" && (
            <WebGlShadowEngine
              baseImage={basePlate}
              casterImage="/images/caster-branch.svg"
              offsetX={output.shadowOffsetX}
              offsetY={output.shadowOffsetY}
              blurRadius={Math.round(14 * output.penumbraMultiplier)}
              shadowOpacity={0.65}
              ambientScale={1.0}
              contactHardening={true}
              onFrameStats={(s) => {
                setEngineFrameTime(s.frameTimeMs);
                setEngineFps(s.fps);
              }}
            />
          )}

          {activeEngine === "komorebi" && (
            <ProceduralKomorebiEngine
              basePlate={basePlate}
              shadowOpacity={0.6}
              scale={4.0}
              speed={0.4}
              contrast={1.7}
              windAngle={45 + output.shadowOffsetX * 1.5}
              mode="gpu"
              onFrameStats={(s) => {
                setEngineFrameTime(s.frameTimeMs);
                setEngineFps(s.fps);
              }}
            />
          )}

          {activeEngine === "branch" && (
            <ProceduralBranchEngine
              basePlate={basePlate}
              shadowOpacity={0.6}
              penumbraRadius={Math.round(12 * output.penumbraMultiplier)}
              windStrength={0.8 + Math.abs(output.shadowOffsetX) * 0.02}
              swaySpeed={1.0}
              branchDepth={4}
              leafDensity={5}
              onFrameStats={(s) => {
                setEngineFrameTime(s.frameTimeMs);
                setEngineFps(s.fps);
              }}
            />
          )}
        </div>

        {/* Virtual Light Indicator (Crosshair) */}
        <div
          className="absolute w-8 h-8 rounded-full border border-amber-300/60 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.5)] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 flex items-center justify-center text-[9px] font-mono font-bold text-amber-200"
          style={{
            left: `${output.normalizedUV.u * 100}%`,
            top: `${output.normalizedUV.v * 100}%`,
            opacity: output.rawPointer.x === 0 && output.rawPointer.y === 0 ? 0.3 : 0.9,
          }}
        >
          ☀
        </div>

        {/* Live Vector Crosshair Overlay HUD */}
        <div className="absolute top-4 left-4 bg-zinc-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-200 font-semibold flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                output.isAtRest ? "bg-zinc-500" : "bg-sky-400 animate-pulse"
              }`}
            />
            <span className="uppercase tracking-wider text-[11px] text-zinc-300">
              {output.isAtRest ? "Resting (Sleep)" : "Spring Active"}
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-sky-400">
            Δ ({output.shadowOffsetX.toFixed(1)}px, {output.shadowOffsetY.toFixed(1)}px)
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-emerald-400">
            Penumbra: {(output.penumbraMultiplier).toFixed(2)}x
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-400">
            {engineFrameTime}ms CPU • {engineFps} FPS
          </span>
        </div>

        {/* Gesture Guidance Overlay */}
        <div className="absolute bottom-4 right-4 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2 pointer-events-none">
          <Move className="w-3 h-3 text-sky-400" />
          <span>Move cursor or touch-drag across stage</span>
        </div>
      </div>

      {/* Parallax & Coordinate Metrics HUD */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl">
          <div className="text-zinc-500 text-[11px] mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" /> Normalized UV / Light 3D
          </div>
          <div className="font-mono text-sm text-zinc-200">
            [{output.normalizedUV.u.toFixed(2)}, {output.normalizedUV.v.toFixed(2)}] • 3D: ({output.virtualLightDirection.x.toFixed(2)}, {output.virtualLightDirection.y.toFixed(2)}, {output.virtualLightDirection.z.toFixed(2)})
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl">
          <div className="text-zinc-500 text-[11px] mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Perspective Tilt &amp; Skew
          </div>
          <div className="font-mono text-sm text-zinc-200">
            {output.skewX.toFixed(1)}° X / {output.skewY.toFixed(1)}° Y
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl">
          <div className="text-zinc-500 text-[11px] mb-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-400" /> Scroll Progress &amp; Delta
          </div>
          <div className="font-mono text-sm text-zinc-200">
            {Math.round(output.scrollProgress * 100)}% (Δ {output.scrollDeltaY.toFixed(0)}px)
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl">
          <div className="text-zinc-500 text-[11px] mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> Active Physics Model
          </div>
          <div className="font-mono text-sm text-zinc-200 capitalize">
            {preset} (k={springConfig.stiffness}, c={springConfig.damping}, m={springConfig.mass})
          </div>
        </div>
      </div>
    </div>
  );
}
