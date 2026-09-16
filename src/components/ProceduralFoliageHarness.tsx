"use client";

import React, { useState } from "react";
import { ProceduralKomorebiEngine } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./engines/ProceduralBranchEngine";
import { CssShadowEngine } from "./engines/CssShadowEngine";
import {
  Sun,
  Trees,
  Wind,
  Layers,
} from "lucide-react";

export function ProceduralFoliageHarness() {
  const [activePreset, setActivePreset] = useState<"komorebi" | "branch" | "image">("komorebi");
  const [baseImage, setBaseImage] = useState("/images/base-minimal-studio.svg");

  // Komorebi params
  const [scale, setScale] = useState(4.5);
  const [speed, setSpeed] = useState(0.5);
  const [contrast, setContrast] = useState(1.6);
  const [windAngle, setWindAngle] = useState(45);
  const [shadowOpacity, setShadowOpacity] = useState(0.55);

  // Branch params
  const [blurRadius, setBlurRadius] = useState(12);
  const [windStrength, setWindStrength] = useState(0.8);
  const [branchDepth, setBranchDepth] = useState(4);
  const [leafDensity, setLeafDensity] = useState(5);

  // Live telemetry
  const [stats, setStats] = useState({
    komorebi: { fps: 60, frameTimeMs: 0.6 },
    branch: { fps: 60, frameTimeMs: 1.8 },
    image: { fps: 60, frameTimeMs: 0.5 },
  });

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 mb-12 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Prototype Ticket #6
            </span>
            <span className="text-xs text-zinc-400">Organic Foliage Evaluation</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100 mt-1">
            Procedural Foliage &amp; Komorebi Canopy Generator
          </h3>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActivePreset("komorebi")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activePreset === "komorebi"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Komorebi (GPU Shader)</span>
          </button>

          <button
            onClick={() => setActivePreset("branch")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activePreset === "branch"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-emerald-300" />
            <span>Parametric Branch</span>
          </button>

          <button
            onClick={() => setActivePreset("image")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activePreset === "image"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Image Mask (Static)</span>
          </button>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 py-4 border-b border-zinc-800/80 text-xs">
        {/* Base Texture */}
        <div>
          <label className="text-zinc-400 font-medium block mb-1">Base Plate Texture</label>
          <select
            value={baseImage}
            onChange={(e) => setBaseImage(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="/images/base-minimal-studio.svg">Minimal Studio</option>
            <option value="/images/base-architectural.svg">Architectural Wall</option>
            <option value="/images/base-dappled-forest.svg">Dappled Forest Wall</option>
          </select>
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
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {activePreset === "komorebi" ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Canopy Density / Scale</label>
                <span className="font-mono text-zinc-300">{scale.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Sun Aperture Contrast</label>
                <span className="font-mono text-zinc-300">{contrast.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" /> Wind Speed
                </label>
                <span className="font-mono text-zinc-300">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.5"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Wind Angle</label>
                <span className="font-mono text-zinc-300">{windAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={windAngle}
                onChange={(e) => setWindAngle(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Branch Recursion Depth</label>
                <span className="font-mono text-zinc-300">{branchDepth}</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                step="1"
                value={branchDepth}
                onChange={(e) => setBranchDepth(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Leaf Density per Node</label>
                <span className="font-mono text-zinc-300">{leafDensity}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={leafDensity}
                onChange={(e) => setLeafDensity(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">Penumbra Blur</label>
                <span className="font-mono text-zinc-300">{blurRadius}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="25"
                value={blurRadius}
                onChange={(e) => setBlurRadius(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-400" /> Sway Strength
                </label>
                <span className="font-mono text-zinc-300">{windStrength.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={windStrength}
                onChange={(e) => setWindStrength(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* Visual Canvas Stage */}
      <div className="mt-6 relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
        {activePreset === "komorebi" && (
          <ProceduralKomorebiEngine
            baseImage={baseImage}
            shadowOpacity={shadowOpacity}
            scale={scale}
            speed={speed}
            contrast={contrast}
            windAngle={windAngle}
            onFrameStats={(s) => setStats((prev) => ({ ...prev, komorebi: s }))}
          />
        )}

        {activePreset === "branch" && (
          <ProceduralBranchEngine
            baseImage={baseImage}
            shadowOpacity={shadowOpacity}
            blurRadius={blurRadius}
            windStrength={windStrength}
            swaySpeed={1.2}
            branchDepth={branchDepth}
            leafDensity={leafDensity}
            onFrameStats={(s) => setStats((prev) => ({ ...prev, branch: s }))}
          />
        )}

        {activePreset === "image" && (
          <CssShadowEngine
            baseImage={baseImage}
            casterImage="/images/caster-branch.svg"
            offsetX={30}
            offsetY={20}
            blurRadius={12}
            shadowOpacity={shadowOpacity}
            ambientScale={1.0}
            onFrameStats={(s) => setStats((prev) => ({ ...prev, image: s }))}
          />
        )}

        {/* Live HUD Badge */}
        <div className="absolute top-4 left-4 bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-200 font-semibold flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">
              {activePreset === "komorebi"
                ? "Komorebi Shader"
                : activePreset === "branch"
                ? "Parametric Skeleton"
                : "Static Image Mask"}
            </span>
          </div>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-emerald-400">
            {activePreset === "komorebi"
              ? `${stats.komorebi.frameTimeMs}ms • ${stats.komorebi.fps} FPS`
              : activePreset === "branch"
              ? `${stats.branch.frameTimeMs}ms • ${stats.branch.fps} FPS`
              : `${stats.image.frameTimeMs}ms • ${stats.image.fps} FPS`}
          </span>
        </div>
      </div>

      {/* Comparative Evaluation Findings Matrix */}
      <div className="mt-8 bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Procedural Foliage vs. Image Mask Evaluation Matrix
          </h4>
          <span className="text-[11px] text-zinc-500 font-mono">Prototype #6 Verdict</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/40 text-zinc-400 border-b border-zinc-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Caster Approach</th>
                <th className="py-2.5 px-4 font-medium">Memory Footprint</th>
                <th className="py-2.5 px-4 font-medium">Animation Organic Realism</th>
                <th className="py-2.5 px-4 font-medium">CPU Frame Cost</th>
                <th className="py-2.5 px-4 font-medium">Resolution Independence</th>
                <th className="py-2.5 px-4 font-medium">Recommended Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              <tr className="bg-emerald-500/5">
                <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-300" /> 1. Komorebi (GPU Simplex)
                </td>
                <td className="py-3 px-4 text-emerald-400 font-mono">0 KB (No textures)</td>
                <td className="py-3 px-4 text-emerald-400">
                  Infinite non-repeating natural canopy swirl &amp; dappled sunlight
                </td>
                <td className="py-3 px-4 text-emerald-400 font-mono">0.0ms (100% Shader)</td>
                <td className="py-3 px-4 text-emerald-400">Infinite (Mathematical)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">Hero/Ambient Backgrounds</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" /> 2. Parametric Branch
                </td>
                <td className="py-3 px-4 text-zinc-300 font-mono">&lt; 15 KB (Joint graph)</td>
                <td className="py-3 px-4 text-zinc-300">
                  Physical hierarchical sway (stiff trunk, oscillating twigs)
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono">1.2ms – 2.0ms / frame</td>
                <td className="py-3 px-4 text-emerald-400">Infinite (Vector)</td>
                <td className="py-3 px-4 text-zinc-300">Botanical &amp; silhouette heroes</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" /> 3. Static Image Mask
                </td>
                <td className="py-3 px-4 text-rose-400 font-mono">500 KB – 2 MB (Texture)</td>
                <td className="py-3 px-4 text-zinc-400">
                  Rigid translation/scale; leaves cannot flutter independently
                </td>
                <td className="py-3 px-4 text-emerald-400 font-mono">0.0ms (Compositor)</td>
                <td className="py-3 px-4 text-amber-400">Fixed raster resolution</td>
                <td className="py-3 px-4 text-zinc-400">Low-tier static poster fallback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
