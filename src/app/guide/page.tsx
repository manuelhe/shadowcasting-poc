"use client";

import React, { useState } from "react";
import { ShowcaseNav } from "../../components/ShowcaseNav";
import {
  ShadowBackground,
  type ShadowCasterConfig,
  type MotionPreset,
} from "../../components/ShadowBackground";
import {
  BookOpen,
  Code,
  Layers,
  Zap,
  HardDrive,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Sliders,
  Info,
} from "lucide-react";

interface RecipeDemo {
  id: string;
  title: string;
  description: string;
  badge: string;
  code: string;
  basePlate: string;
  caster: ShadowCasterConfig;
  penumbra: number;
  contactHardening: boolean;
  shadowOpacity: number;
  motion: MotionPreset | { preset?: MotionPreset; ambient?: boolean; ambientSpeed?: number; ambientStrength?: number };
  basePlateMotion?: boolean;
}

const RECIPES: RecipeDemo[] = [
  {
    id: "recipe-1",
    title: "1. Minimal Photographic Hero with Vector Branch Caster",
    description: "Standard editorial hero header with stationary architectural drywall and interactive botanical branch shadow.",
    badge: "Vector SVG Caster",
    basePlate: "/images/base-architectural.svg",
    caster: {
      type: "image",
      src: "/images/caster-branch.svg",
      opacity: 0.75,
    },
    penumbra: 0.025,
    contactHardening: true,
    shadowOpacity: 0.65,
    motion: "smooth",
    code: `import { ShadowBackground } from "@/components/ShadowBackground";

export function HeroSection() {
  return (
    <ShadowBackground
      basePlate="/images/base-architectural.svg"
      poster="/images/hero-fallback.webp"
      caster={{
        type: "image",
        src: "/images/caster-branch.svg",
        opacity: 0.75,
      }}
      penumbra={0.025}
      contactHardening={true}
      motion="smooth"
      className="relative min-h-[500px] w-full"
    >
      <div className="mx-auto max-w-4xl px-8 py-24 text-white">
        <h1 className="text-5xl font-serif">Architectural Light</h1>
        <p className="mt-4 text-zinc-300">Decoupled dynamic shadowcasting.</p>
      </div>
    </ShadowBackground>
  );
}`,
  },
  {
    id: "recipe-2",
    title: "2. Procedural Komorebi Sunlight on Studio Wall",
    description: "Generates organic dappled sunlight filtering through canopy leaves with zero image wire payload.",
    badge: "Zero-Asset Shader",
    basePlate: "/images/base-minimal-studio.svg",
    caster: {
      type: "komorebi",
      density: 0.85,
      contrast: 1.3,
      scale: 2.5,
      speed: 0.6,
    },
    penumbra: 0.04,
    contactHardening: false,
    shadowOpacity: 0.5,
    motion: {
      preset: "inertial",
      ambient: true,
      ambientSpeed: 0.5,
      ambientStrength: 10,
    },
    code: `import { ShadowBackground } from "@/components/ShadowBackground";

export function StudioKomorebiHero() {
  return (
    <ShadowBackground
      basePlate="/images/base-minimal-studio.svg"
      caster={{
        type: "komorebi",
        density: 0.85,
        contrast: 1.3,
        scale: 2.5,
        speed: 0.6,
      }}
      shadowOpacity={0.5}
      penumbra={0.04}
      contactHardening={false}
      motion={{
        preset: "inertial",
        ambient: true,
        ambientSpeed: 0.5,
        ambientStrength: 10,
      }}
      className="relative h-[500px] w-full"
    />
  );
}`,
  },
  {
    id: "recipe-3",
    title: "3. Procedural Branch Skeleton with Custom Leaf Density",
    description: "Synthesizes a living tree branch directly in GPU memory with configurable density and wind physics.",
    badge: "Procedural Branch",
    basePlate: "/images/base-architectural.svg",
    caster: {
      type: "branch",
      depth: 4,
      leafDensity: 5,
      swaySpeed: 0.8,
    },
    penumbra: 0.02,
    contactHardening: true,
    shadowOpacity: 0.7,
    motion: "bouncy",
    code: `import { ShadowBackground } from "@/components/ShadowBackground";

export function BotanicalShowcase() {
  return (
    <ShadowBackground
      basePlate="/images/base-architectural.svg"
      caster={{
        type: "branch",
        depth: 4,
        leafDensity: 5,
        swaySpeed: 0.8,
      }}
      contactHardening={true}
      penumbra={0.02}
      motion="bouncy"
      className="h-[500px] w-full"
    />
  );
}`,
  },
  {
    id: "recipe-4",
    title: "4. Scroll-Driven Shadow Parallax",
    description: "Shadow position responds smoothly to vertical scroll position alongside pointer interaction.",
    badge: "Scroll Parallax",
    basePlate: "/images/base-minimal-studio.svg",
    caster: {
      type: "image",
      src: "/images/caster-branch.svg",
      opacity: 0.8,
    },
    penumbra: 0.03,
    contactHardening: true,
    shadowOpacity: 0.6,
    motion: {
      preset: "smooth",
      ambient: true,
      ambientSpeed: 0.4,
      ambientStrength: 8,
    },
    code: `import { ShadowBackground } from "@/components/ShadowBackground";

export function EditorialLongform() {
  return (
    <ShadowBackground
      basePlate="/images/base-minimal-studio.svg"
      caster={{
        type: "image",
        src: "/images/caster-branch.svg",
      }}
      motion={{
        preset: "smooth",
        scrollInfluence: 0.35, // 35% vertical scroll coupling
        maxDisplacementPx: 45,
      }}
      className="relative h-[500px] w-full"
    />
  );
}`,
  },
  {
    id: "recipe-5",
    title: "5. Coupled Base Plate Motion (3D Perspective Tilt)",
    description: "Enables full 3D card tilt where the background substrate tilts in perspective alongside the cast shadow.",
    badge: "Coupled 3D Motion",
    basePlate: "/images/base-architectural.svg",
    caster: {
      type: "image",
      src: "/images/caster-branch.svg",
      opacity: 0.8,
    },
    penumbra: 0.025,
    contactHardening: true,
    shadowOpacity: 0.65,
    motion: "snappy",
    basePlateMotion: true,
    code: `import { ShadowBackground } from "@/components/ShadowBackground";

export function InteractiveCardHero() {
  return (
    <ShadowBackground
      basePlate="/images/base-architectural.svg"
      caster={{
        type: "image",
        src: "/images/caster-branch.svg",
      }}
      basePlateMotion={true} // Couples Base Plate to 3D perspective tilt
      motion="snappy"
      className="h-[500px] w-full rounded-2xl"
    />
  );
}`,
  },
];

export default function GuidePage() {
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const activeRecipe = RECIPES[activeRecipeIndex];

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-200 overflow-x-hidden">
      <ShowcaseNav />

      {/* Background Lighting Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/8 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-24 flex flex-col gap-16 sm:gap-24">
        {/* ========================================================================= */}
        {/* 1. Header Section: Developer Documentation Title & Badges                 */}
        {/* ========================================================================= */}
        <header className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          <div
            data-testid="guide-kicker"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engineering Implementation Guide • Next.js 15</span>
          </div>

          <h1
            data-testid="guide-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans text-balance leading-tight"
          >
            <code className="text-emerald-400 font-mono font-semibold">&lt;ShadowBackground /&gt;</code> Architecture &amp; Developer Manual
          </h1>

          <p
            data-testid="guide-subtitle"
            className="text-lg sm:text-xl text-zinc-300 font-light max-w-3xl leading-relaxed text-pretty"
          >
            A comprehensive reference manual detailing the decoupled two-layer composite architecture,
            WebGL 2.0 Poisson-disk contact hardening shaders, spring physics controllers, and
            copy-paste implementation recipes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono pt-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              0 KB Base Plate VRAM
            </span>
            <span className="px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300">
              0.000 CLS Guaranteed
            </span>
            <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              ~140 KB Total Payload
            </span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              &lt; 2% Idle CPU Sleep
            </span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. Interactive Recipes Workbench (Live Previews + Code)                   */}
        {/* ========================================================================= */}
        <section aria-labelledby="recipes-heading" className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
                <Code className="w-3.5 h-3.5" />
                <span>Interactive Workbench</span>
              </div>
              <h2 id="recipes-heading" className="text-2xl sm:text-3xl font-bold text-white">
                Live Implementation Recipes
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Switch tabs to inspect live WebGL/Canvas2D synthesis and copy drop-in component code.
            </p>
          </div>

          {/* Recipe Tab Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {RECIPES.map((recipe, idx) => (
              <button
                key={recipe.id}
                onClick={() => setActiveRecipeIndex(idx)}
                data-testid={`recipe-tab-${idx}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                  idx === activeRecipeIndex
                    ? "bg-emerald-500 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {recipe.badge}
              </button>
            ))}
          </div>

          {/* Recipe Interactive Display Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            {/* Left Column: Live Interactive Canvas */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{activeRecipe.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{activeRecipe.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono text-xs hidden sm:inline">
                  Interactive Live
                </span>
              </div>

              {/* Rendered Live Component */}
              <div className="relative h-[380px] w-full rounded-2xl overflow-hidden border border-zinc-700/60 shadow-xl">
                <ShadowBackground
                  basePlate={activeRecipe.basePlate}
                  caster={activeRecipe.caster}
                  penumbra={activeRecipe.penumbra}
                  contactHardening={activeRecipe.contactHardening}
                  shadowOpacity={activeRecipe.shadowOpacity}
                  motion={activeRecipe.motion}
                  basePlateMotion={activeRecipe.basePlateMotion}
                  className="h-full w-full"
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                    <div className="bg-zinc-950/70 backdrop-blur-md px-6 py-4 rounded-xl border border-zinc-800 text-center pointer-events-auto">
                      <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                        {activeRecipe.badge}
                      </span>
                      <p className="text-sm font-semibold text-white mt-1">
                        Move mouse / drag touch to interact
                      </p>
                    </div>
                  </div>
                </ShadowBackground>
              </div>
            </div>

            {/* Right Column: Copyable Drop-In Code */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950 rounded-2xl border border-zinc-800 p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <span className="text-zinc-400 flex items-center gap-1.5 font-sans font-medium">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  Drop-In Snippet
                </span>
                <button
                  onClick={() => handleCopyCode(activeRecipe.id, activeRecipe.code)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition"
                >
                  {copiedCodeId === activeRecipe.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-200/90 font-mono scrollbar-none flex-1">
                <code>{activeRecipe.code}</code>
              </pre>

              <div className="border-t border-zinc-800/80 pt-3 mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Next.js 15 • App Router</span>
                <span className="text-emerald-400">Ready to Paste</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. Architectural Deep Dive: 4 Pillars of the Decoupled Model              */}
        {/* ========================================================================= */}
        <section aria-labelledby="architecture-heading" className="flex flex-col gap-8">
          <div className="border-b border-zinc-800 pb-4">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">
              Core Mechanics
            </span>
            <h2 id="architecture-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Architectural Foundations (ADR-0001 &amp; ADR-0002)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Decoupled Substrate</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The photographic wall remains rigid in the DOM while shadows synthesize on a
                transparent overlay, preserving optical realism without floating wall distortions.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">0 KB Base Plate VRAM</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Eliminates 100% of redundant GPU texture uploads. Prevents mobile memory thrashing
                and Safari WebContent Jetsam crashes.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">5% Bleed Margin</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The shadow canvas is overscanned by 5% (-5% insets, 110% dimensions). 3D perspective
                tilts up to ±15° never expose outer clipping edges.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Rest Sleep (&lt; 2% CPU)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Second-order harmonic spring halts the animation loop when velocity &lt; 0.0001,
                preserving battery life until mouse wake.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. Complete Props Reference Table                                         */}
        {/* ========================================================================= */}
        <section aria-labelledby="props-heading" className="flex flex-col gap-6">
          <div className="border-b border-zinc-800 pb-4">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
              API Reference
            </span>
            <h2 id="props-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              <code className="text-emerald-400 font-mono">&lt;ShadowBackground /&gt;</code> Props Specification
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Prop</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Default</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">basePlate</td>
                  <td className="py-3 px-4 text-zinc-400">string</td>
                  <td className="py-3 px-4 text-rose-400">Required</td>
                  <td className="py-3 px-4 font-sans">
                    URL or path to stationary photographic substrate image (WebP, JPEG, SVG).
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">caster</td>
                  <td className="py-3 px-4 text-zinc-400">ShadowCasterConfig</td>
                  <td className="py-3 px-4 text-rose-400">Required</td>
                  <td className="py-3 px-4 font-sans">
                    Discriminated union: image silhouette, komorebi noise, or procedural branch.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">penumbra</td>
                  <td className="py-3 px-4 text-zinc-400">number</td>
                  <td className="py-3 px-4 text-zinc-400">0.02</td>
                  <td className="py-3 px-4 font-sans">
                    Diffusion softness radius of shadow boundaries (typical: 0.005 to 0.06).
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">contactHardening</td>
                  <td className="py-3 px-4 text-zinc-400">boolean</td>
                  <td className="py-3 px-4 text-zinc-400">true</td>
                  <td className="py-3 px-4 font-sans">
                    When true, shadows are sharp near anchor contact and expand outward.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">shadowOpacity</td>
                  <td className="py-3 px-4 text-zinc-400">number</td>
                  <td className="py-3 px-4 text-zinc-400">0.65</td>
                  <td className="py-3 px-4 font-sans">
                    Darkness multiplier of the cast shadow layer (0.0 to 1.0).
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">motion</td>
                  <td className="py-3 px-4 text-zinc-400">MotionPreset | MotionConfig</td>
                  <td className="py-3 px-4 text-zinc-400">&quot;smooth&quot;</td>
                  <td className="py-3 px-4 font-sans">
                    Preset name (&quot;smooth&quot;, &quot;snappy&quot;, &quot;inertial&quot;, &quot;bouncy&quot;) or physics config object.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">basePlateMotion</td>
                  <td className="py-3 px-4 text-zinc-400">boolean</td>
                  <td className="py-3 px-4 text-zinc-400">false</td>
                  <td className="py-3 px-4 font-sans">
                    When true, couples the Base Plate to 3D perspective tilt alongside the shadow.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">tier / degradation</td>
                  <td className="py-3 px-4 text-zinc-400">DegradationTier</td>
                  <td className="py-3 px-4 text-zinc-400">&quot;auto&quot;</td>
                  <td className="py-3 px-4 font-sans">
                    Hardware ladder: &quot;auto&quot;, &quot;full-dynamic&quot;, &quot;low-dynamic&quot;, &quot;static-poster&quot;.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">onRest / onWake</td>
                  <td className="py-3 px-4 text-zinc-400">() =&gt; void</td>
                  <td className="py-3 px-4 text-zinc-400">undefined</td>
                  <td className="py-3 px-4 font-sans">
                    Telemetry hooks called when spring physics settles to sleep or wakes.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. Production Best Practices & Diagnostics                                */}
        {/* ========================================================================= */}
        <section aria-labelledby="best-practices-heading" className="flex flex-col gap-6">
          <div className="border-b border-zinc-800 pb-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
              Deployment &amp; Quality
            </span>
            <h2 id="best-practices-heading" className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Production Best Practices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Core Web Vitals Guarantees</span>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300">
                <li>• Always declare explicit container height or aspect ratio to ensure 0.000 CLS.</li>
                <li>• Keep photographic Base Plate file weight under 120 KB (WebP/AVIF format).</li>
                <li>• Provide a static poster fallback for high-latency mobile networks.</li>
              </ul>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                <Info className="w-4 h-4" />
                <span>Chromium WebGL Compatibility</span>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300">
                <li>• Ensure SVGs include explicit pixel width and height matching viewBox.</li>
                <li>• uploadTextureImage utility automatically handles offscreen 2D rasterization.</li>
                <li>• Direct bitmap paths (PNG, WebP, JPEG) remain zero-copy GPU texture uploads.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
