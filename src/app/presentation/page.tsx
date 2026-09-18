"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShowcaseNav } from "../../components/ShowcaseNav";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  Volume2,
  Info,
  Eye,
  Sliders,
} from "lucide-react";

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  blueprint: string;
  keyPoints: string[];
  speakerNotes: string;
  contentNode: React.ReactNode;
}

const SLIDES: SlideData[] = [
    {
      id: 1,
      title: "Living Light & Dynamic Shadows",
      subtitle: "From Static Interfaces to Tactile Architecture",
      category: "Vision & Creative Introduction",
      badge: "Slide 01 / 10",
      blueprint: `┌────────────────────────────────────────────────────────────────────────┐
│   LIVING LIGHT & DYNAMIC SHADOWS                                       │
│   From Static Interfaces to Tactile Architecture                       │
│   Next-Generation Ambient Backgrounds in Modern Web Applications       │
│   Engineering & Creative Technology Team · Autumn 2026                 │
└────────────────────────────────────────────────────────────────────────┘`,
      keyPoints: [
        "Web interfaces frequently feel flat and clinical when confined to flat CSS background colors or static photography.",
        "Ambient motion—sunlight filtering through window blinds, foliage rustling in a gentle breeze—creates immediate tactile luxury.",
        "Engineering has launched <ShadowBackground />: real-time, interactive, photorealistic light and shadow without video lag.",
      ],
      speakerNotes:
        "Welcome everyone. Today we are introducing a new design capability developed by engineering. For years, we've wanted our landing pages and editorial features to feel like living architectural spaces—with soft afternoon sunlight, wind-blown branch shadows, and subtle reaction to user movement. Today, we'll show you what the engineering team can build with your artwork, the optical realism we can achieve, and the exact assets we need from you to make it seamless.",
      contentNode: (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Creative Technology Briefing • Product Design</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-serif max-w-3xl leading-tight">
            Living Light &amp; Dynamic Shadows
          </h2>
          <p className="text-xl sm:text-2xl text-amber-200/90 font-light max-w-2xl">
            From Static Interfaces to Tactile Architecture
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
              Payload: ~140 KB Total
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              60 FPS Guaranteed
            </span>
            <span className="px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300">
              Core Web Vitals: 0.000 CLS
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "The Status Quo Dilemma",
      subtitle: "Why Traditional Video Loops & 3D Engines Fail in Production",
      category: "Performance Analysis",
      badge: "Slide 02 / 10",
      blueprint: `Traditional Video Loop (15MB–40MB)   Traditional 3D Scene Graph (Three.js/Spline)
┌─────────────────────────────────┐   ┌──────────────────────────────────────────┐
│ • Massive download payload      │   │ • 1.5MB–5MB 3D meshes & 4K textures      │
│ • Unreactive to user input      │   │ • 150KB–500KB JS runtime overhead        │
│ • Continuous battery drain      │   │ • 60MB–120MB GPU VRAM allocation         │
│ • Delayed LCP & buffering gaps  │   │ • Mobile thermal throttling & frame drops│
└─────────────────────────────────┘   └──────────────────────────────────────────┘`,
      keyPoints: [
        "10-second 1080p video loops consume 15MB–40MB, drain mobile batteries continuously (12–28% CPU), and cannot react to user cursor or scroll.",
        "3D engines (Three.js/Spline) require 150KB–500KB JS bundles, allocate 60MB–120MB VRAM, and cause mobile devices to overheat and drop to 18 FPS.",
        "Our Decoupled Architecture delivers 100% of the visual fidelity at ~140KB total payload with < 2% idle CPU.",
      ],
      speakerNotes:
        "As designers, you've probably proposed background video loops before, only to have engineering reject them because of bandwidth and mobile battery drain. Or you tried Spline 3D, and the page took 4 seconds to load. We built this component specifically to end that compromise. We get the rich, organic ambiance of video, but with zero lag, instant page load, and real-time responsiveness to user touch.",
      contentNode: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              <span>Video Loops (15MB–40MB)</span>
            </div>
            <ul className="text-xs space-y-2.5 text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Enormous download weight causes high mobile data abandonment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Completely unreactive to mouse cursor, touch, or scroll velocity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Continuous hardware decode consumes 15–28% battery even when idle.</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              <span>3D Scene Graphs (Three.js/Spline)</span>
            </div>
            <ul className="text-xs space-y-2.5 text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>150KB–500KB JS library bundle delays initial page bootstrap.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>60MB–120MB GPU memory allocation triggers mobile throttling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>Requires 3D modeling tools (Blender/Cinema4D) rather than 2D design.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "The Decoupled Architecture",
      subtitle: "Why Separating Wall & Shadow Creates Genuine Physical Realism",
      category: "System Mechanics",
      badge: "Slide 03 / 10",
      blueprint: `┌────────────────────────────────────────────────────────┐
│ Foreground Interactive Content (DOM z-index: 10)       │
│ Headings, typography, buttons, interactive forms       │
└────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────┐
│ Decoupled Dynamic Shadow Canvas (WebGL / Canvas 2D)    │
│ Transparent alpha buffer, 5% bleed overscan margin,    │
│ CSS mix-blend-mode: multiply, pointer-events: none     │
└────────────────────────────────────────────────────────┘
                           ▲
┌────────────────────────────────────────────────────────┐
│ Stationary DOM Base Plate (Next.js <Image priority />) │
│ Photographic substrate, hardware-composited, 0 KB VRAM │
└────────────────────────────────────────────────────────┘`,
      keyPoints: [
        "In physical reality, walls stay stationary within their inertial reference frame while shadows cast across them.",
        "Layer 1 (Base Plate): Handled in the DOM with Next.js <Image priority /> (0 KB redundant WebGL VRAM).",
        "Layer 2 (Shadow Canvas): Hardware-accelerated transparent canvas using mix-blend-mode: multiply and 5% bleed overscan.",
        "Layer 3 (Foreground UI): Standard accessible DOM typography and components.",
      ],
      speakerNotes:
        "The secret to why this looks so realistic and runs so fast is the 'Decoupled Layer Architecture'. Early prototypes tried to tilt both the wall and the shadow in 3D, which made the wall look like a warped cardboard poster. By keeping your background photograph completely stationary and moving only the shadow across its surface, your eyes perceive genuine physical depth. Furthermore, because the browser handles the photo in the DOM, our shadow engine consumes 0 KB of redundant GPU texture memory.",
      contentNode: (
        <div className="flex flex-col gap-4 p-6">
          <div className="bg-zinc-900/80 border border-zinc-700/70 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 font-mono text-xs">
                Layer 3
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white">Foreground UI Content</h4>
                <p className="text-xs text-zinc-400">
                  DOM z-index: 10 • Accessible headings, buttons, and navigation
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-mono">100% Interactive</span>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-xs">
                Layer 2
              </span>
              <div>
                <h4 className="text-sm font-semibold text-purple-200">
                  Dynamic Shadow Canvas (Transparent Alpha)
                </h4>
                <p className="text-xs text-zinc-400">
                  WebGL 2.0 / Canvas 2D • 5% Bleed overscan margin • mix-blend-mode: multiply
                </p>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-mono">60 FPS Synth</span>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs">
                Layer 1
              </span>
              <div>
                <h4 className="text-sm font-semibold text-emerald-200">
                  Stationary DOM Base Plate (Photographic Substrate)
                </h4>
                <p className="text-xs text-zinc-400">
                  Next.js &lt;Image priority fill /&gt; • 0 KB GPU VRAM • SSR Zero-LCP Floor
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-mono">0.000 CLS</span>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "What Development Can Do With It",
      subtitle: "Optical Realism, Physics Engines & Lighting Control",
      category: "Engineering Capabilities",
      badge: "Slide 04 / 10",
      blueprint: `┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ INTERACTIVE PHYSICS     │ CONTACT HARDENING       │ AMBIENT WIND SWAY       │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Spring-damped tracking│ • Crisp near contact    │ • Gentle organic motion │
│ • Parallax tilt (±15°)  │ • Soft, diffused edges  │ • Zero battery cost at  │
│ • Multi-touch & scroll  │   at distance           │   rest (< 2% CPU)       │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘`,
      keyPoints: [
        "Interactive pointer & touch tracking with calibrated spring presets: 'smooth', 'snappy', 'inertial', 'bouncy'.",
        "Optical Contact Hardening: Shadows are sharp near the contact surface and dissolve into soft penumbra with distance.",
        "Ambient Wind Motion: Continuous, natural wind sway without video loops.",
        "Scroll-coupled lighting: Shadow perspective moves organically with page scroll position.",
        "Rest threshold: Suspends animation loop when motion settles, consuming < 2% CPU.",
      ],
      speakerNotes:
        "Here is what we can do once you hand off your assets: We can make the shadow react to mouse movements with physical inertia. We can turn on 'Contact Hardening', meaning the branch near the top of the frame is razor-sharp, while the foliage lower down dissolves into soft, dreamy blur. We can simulate gentle breezes, or tie the light position directly to how far down the page the reader has scrolled. And unlike video, when the user stops moving, the engine goes to sleep so their laptop fan never turns on.",
      contentNode: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Spring Physics</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Harmonic oscillator physics simulating mass, tension, and damping for tactile inertia.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Contact Hardening</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              12-tap Poisson-disk sampling expands kernel radius based on distance from anchor.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Smart Rest Sleep</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Animation halts automatically when motion settles, keeping CPU idle at &lt; 2%.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Procedural Light (Zero-Asset Komorebi)",
      subtitle: "Dappled Sunlight & Botanical Skeletons Generated in Code",
      category: "Procedural Synthesis",
      badge: "Slide 05 / 10",
      blueprint: `┌────────────────────────────────────────────────────────────────────────┐
│   PROCEDURAL KOMOREBI (木漏れ日)                                       │
│   Sunlight filtering through canopy leaves, computed mathematically    │
│   • Asset Download: 0 KB (No silhouette image required)                │
│   • Infinite Variety: No looping seams or repeating gif artifacts      │
│   • Designer Controls: Density, Contrast, Scale, Wind Speed            │
└────────────────────────────────────────────────────────────────────────┘`,
      keyPoints: [
        "Komorebi (木漏れ日): Sunlight filtering through canopy leaves, generated via real-time GLSL fractional Brownian motion noise.",
        "Zero Wire Download (0 KB): No silhouette images or video files to download.",
        "Procedural Branch Skeleton: Stochastic L-system tree branches with wind harmonics.",
        "Designer Tuning: Density, contrast, scale, and wind speed can be calibrated through simple numeric tokens.",
      ],
      speakerNotes:
        "One of our most powerful features is Procedural Komorebi—the Japanese term for sunlight filtering through trees. If you want a serene, dappled light effect on a minimalist interior or studio wall, you don't even need to draw a branch! We can generate the dappled light pattern entirely in code. You simply specify how dense you want the sunlight spots, how sharp the contrast should be, and how fast the wind should blow.",
      contentNode: (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-white">
                Zero-Asset Procedural Canopy
              </h4>
              <p className="text-xs text-zinc-400">
                Mathematical fBm shader noise simulates wind-stirred tree canopies.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Asset Download: 0 KB
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                Density
              </span>
              <p className="text-base font-bold text-amber-400 font-mono">0.65 – 1.2</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                Contrast
              </span>
              <p className="text-base font-bold text-sky-400 font-mono">1.0 – 1.8</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                Scale
              </span>
              <p className="text-base font-bold text-purple-400 font-mono">1.0 – 4.0</p>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                Wind Speed
              </span>
              <p className="text-base font-bold text-emerald-400 font-mono">0.4 – 1.5</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Creative Boundaries: What We Can & Cannot Do",
      subtitle: "Aligning Design Ambition with Architectural Reality",
      category: "Creative Guardrails",
      badge: "Slide 06 / 10",
      blueprint: `┌───────────────────────────────────────┬───────────────────────────────────────┐
│ WHAT WE CAN DO (High Confidence)      │ WHAT WE CANNOT DO (Engine Limitations)│
├───────────────────────────────────────┼───────────────────────────────────────┤
│ ✅ Planar surface casting             │ ❌ Casting across complex 3D meshes   │
│    (Walls, floors, cards, canvases)   │    (e.g., stairs, undulating statues) │
│ ✅ Variable softness & penumbra       │ ❌ Colored glass caustics             │
│ ✅ Real-time light direction changes  │    (Unless rendered into the texture) │
│ ✅ Vector silhouettes & alpha PNGs    │ ❌ Removing hard baked-in shadows from│
│ ✅ 60 FPS mobile performance          │    flat background stock photos       │
└───────────────────────────────────────┴───────────────────────────────────────┘`,
      keyPoints: [
        "Planar Surfaces: Designed specifically for walls, interior backdrops, card panels, and editorial hero headers.",
        "No Complex 3D Meshes: We cannot bend shadows over winding stairs or irregular 3D sculptures without full 3D engine geometry.",
        "No Stained Glass Caustics: Dynamic colored caustics require specialized custom texture channels.",
        "Diffused Photography: Background photos must have even, diffused lighting without hard baked-in sunbeams.",
      ],
      speakerNotes:
        "To keep our collaboration smooth, let's talk about creative boundaries. Our component is designed for planar architectural surfaces: walls, desktops, paper substrates, and UI cards. It is not a replacement for Unreal Engine—we cannot wrap a shadow around a 3D statue. Also, when selecting background photography, look for images with even, diffuse lighting. If a stock photo already has harsh midday shadows baked into the wallpaper, casting our dynamic shadow over it will look confusing.",
      contentNode: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>What Engineering CAN Do (Supported)</span>
            </div>
            <ul className="text-xs space-y-2 text-zinc-300">
              <li>• Cast shadows over planar surfaces (drywall, wood, concrete).</li>
              <li>• Adjust penumbra blur, shadow opacity, and light angle.</li>
              <li>• Animate pointer tracking, ambient wind, and scroll parallax.</li>
              <li>• Support both vector SVGs and 32-bit alpha PNG silhouettes.</li>
              <li>• Maintain 60 FPS with 0.000 layout shift on mobile and desktop.</li>
            </ul>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              <span>What Engineering CANNOT Do (Out of Scope)</span>
            </div>
            <ul className="text-xs space-y-2 text-zinc-300">
              <li>• Wrap shadows across complex 3D meshes (statues, curved terrain).</li>
              <li>• Render colored stained-glass caustics dynamically.</li>
              <li>• Erase or replace hard shadows already baked into stock photos.</li>
              <li>• Perform real-time occlusion around foreground DOM text.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "The 4 Essential Design Deliverables",
      subtitle: "The Complete Asset Package Required for Production",
      category: "Design Handoff",
      badge: "Slide 07 / 10",
      blueprint: `┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ 1. BASE PLATE           │ 2. SHADOW CASTER        │ 3. STATIC POSTER        │ 4. INTENT SPEC SHEET    │
├─────────────────────────┼─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Clean substrate photo │ • Pure black silhouette │ • Flattened composite   │ • Light direction       │
│ • No baked shadows      │ • Vector SVG or         │ • Used for SSR / mobile │ • Penumbra softness     │
│ • 1920×1080 @ 1x/2x     │   32-bit alpha PNG      │   battery saver         │ • Motion preset & speed │
│ • WebP / AVIF format    │ • Explicit dimensions   │ • WebP format           │ • Contact hardening Y/N │
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘`,
      keyPoints: [
        "1. Base Plate Substrate: Clean photograph without shadows, 1920×1080 WebP/AVIF format (< 120KB).",
        "2. Shadow Caster: Pure black silhouette with alpha (#000000), vector SVG with explicit dimensions (< 25KB).",
        "3. Static Poster Fallback: Flattened composite image for SSR zero-LCP floor and low-tier devices.",
        "4. Motion & Lighting Intent Sheet: Parameter tokens for light angle, softness, and spring preset.",
      ],
      speakerNotes:
        "Here is our four-part delivery checklist. Whenever you design a hero header or feature section using this effect, we need these four items from your Figma file: First, the clean background photo. Second, the shadow silhouette cutout. Third, a static flattened export of the finished look for instant loading on slow mobile devices. And fourth, a quick spec sheet with your desired light direction and motion mood. Let's look at the exact export rules for each.",
      contentNode: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-amber-400 font-mono text-xs font-semibold">01. Base Plate</span>
            <h5 className="text-sm font-semibold text-white">Substrate Photo</h5>
            <p className="text-xs text-zinc-400">
              Clean photographic background. No baked shadows. WebP/AVIF format.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-sky-400 font-mono text-xs font-semibold">02. Shadow Caster</span>
            <h5 className="text-sm font-semibold text-white">Silhouette Cutout</h5>
            <p className="text-xs text-zinc-400">
              Pure black #000000 vector SVG or 32-bit PNG. Explicit width &amp; height.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-purple-400 font-mono text-xs font-semibold">03. Static Poster</span>
            <h5 className="text-sm font-semibold text-white">Fallback Frame</h5>
            <p className="text-xs text-zinc-400">
              Pre-rendered composite for SSR and battery saver tier.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-emerald-400 font-mono text-xs font-semibold">04. Intent Sheet</span>
            <h5 className="text-sm font-semibold text-white">Lighting Tokens</h5>
            <p className="text-xs text-zinc-400">
              Figma tokens specifying light angle, softness, and spring personality.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: "Figma & SVG Export Specifications",
      subtitle: "Technical Guidelines for Flawless GPU Texture Uploads",
      category: "Export Standards",
      badge: "Slide 08 / 10",
      blueprint: `┌──────────────────────┬──────────────────────┬─────────────┬────────────┐
│ ASSET                │ FORMAT               │ RESOLUTION  │ MAX SIZE   │
├──────────────────────┼──────────────────────┼─────────────┼────────────┤
│ 1. Base Plate        │ WebP (Quality: 85%)  │ 1920 × 1080 │ < 120 KB   │
│ 2. Shadow Caster     │ Optimized SVG        │ 800 × 600   │ < 25 KB    │
│ 2b. Raster Caster    │ 32-bit PNG (Alpha)   │ 1024 × 1024 │ < 80 KB    │
│ 3. Static Poster     │ WebP (Quality: 80%)  │ 1920 × 1080 │ < 140 KB   │
└──────────────────────┴──────────────────────┴─────────────┴────────────┘`,
      keyPoints: [
        "CRITICAL: SVGs must include explicit pixel width and height attributes matching viewBox (e.g., width='800' height='600'). Setting width='100%' triggers Chromium WebGL errors.",
        "Color: Silhouette must be pure black (#000000). Use opacity gradients rather than grey fills for soft leaves.",
        "Bleed Margin: Leave 15% breathing room around foliage so stems don't clip when tilting or swaying.",
        "File Size: Base Plate < 120KB, Vector Caster < 25KB, Poster < 140KB.",
      ],
      speakerNotes:
        "Take note of rule number one! In Chrome on Mac, SVG textures fail to upload to the GPU if they don't have explicit pixel width and height attributes. When exporting from Figma, make sure your SVG frame has a fixed width and height (like 800 by 600) rather than '100%'. Also, always make your shadow silhouette pure black (#000000) using transparency for soft edges. And leave a little extra stem extending outside your frame so it doesn't get clipped when the wind sways.",
      contentNode: (
        <div className="flex flex-col gap-4 p-6">
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <strong className="text-amber-300 font-semibold">
                Critical Chromium WebGL Constraint:
              </strong>
              <p>
                When exporting SVGs from Figma or Illustrator, uncheck &apos;Responsive&apos; or ensure the
                resulting code specifies explicit dimensions:
                <code className="text-amber-200 font-mono ml-1">
                  &lt;svg width=&quot;800&quot; height=&quot;600&quot; viewBox=&quot;0 0 800 600&quot;&gt;
                </code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <h5 className="font-semibold text-white mb-2">Silhouette Formatting Rules</h5>
              <ul className="space-y-1.5 text-zinc-400">
                <li>• Pure black fill (<span className="text-zinc-200 font-mono">#000000</span>).</li>
                <li>• Use alpha transparency for feathering.</li>
                <li>• No embedded white rectangles or clipping masks.</li>
              </ul>
            </div>
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <h5 className="font-semibold text-white mb-2">Bleed &amp; Margin Rules</h5>
              <ul className="space-y-1.5 text-zinc-400">
                <li>• 15% outer bleed padding around foliage stems.</li>
                <li>• Avoid harsh cropping at the canvas boundaries.</li>
                <li>• Test against both light and dark base plates.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: "Motion & Lighting Spec Sheet (Token Template)",
      subtitle: "The Copy-Paste Handoff Specification for Figma",
      category: "Handoff Template",
      badge: "Slide 09 / 10",
      blueprint: `┌────────────────────────────────────────────────────────────────────────┐
│                SHADOWCASTING DESIGN INTENT TOKEN SHEET                 │
├────────────────────────────────────────────────────────────────────────┤
│ Section Name:          [ e.g., Hero Header / Editorial Feature ]       │
│ Base Plate Asset:      [ e.g., /assets/plaster-wall-dark.webp ]        │
│ Caster Asset:          [ e.g., /assets/palm-frond-silhouette.svg ]     │
├────────────────────────────────────────────────────────────────────────┤
│ LIGHTING PARAMETERS                                                    │
│ • Light Direction:     [ ] Top-Left   [X] Top-Right   [ ] Overhead     │
│ • Shadow Opacity:      [ 65% ] (Recommended: 40% – 75%)                │
│ • Penumbra Softness:   [ ] Crisp (0.01)  [X] Soft (0.03)  [ ] Hazy(0.06)│
│ • Contact Hardening:   [X] Enabled       [ ] Disabled                  │
├────────────────────────────────────────────────────────────────────────┤
│ MOTION PERSONALITY                                                     │
│ • Motion Preset:       [X] Smooth (Editorial)    [ ] Snappy (Modern)   │
│                        [ ] Inertial (Heavy)      [ ] Bouncy            │
│ • Ambient Wind Sway:   [X] Gentle Breeze         [ ] Off               │
│ • Scroll Coupling:     [ ] Enabled (30%)         [X] Disabled          │
└────────────────────────────────────────────────────────────────────────┘`,
      keyPoints: [
        "Standardized Figma Token Sheet template enables designers to specify lighting and motion directly in inspection notes.",
        "Light Direction: Select Top-Left, Top-Right, or Overhead vector.",
        "Penumbra Softness: Crisp (0.01), Soft (0.03), or Hazy (0.06).",
        "Motion Personality: Smooth (luxury/editorial), Snappy (e-commerce), or Inertial (cinematic).",
      ],
      speakerNotes:
        "To make handing off your designs as easy as filling out a brief, we created this standard Token Sheet. You can paste this right into your Figma specs. You pick the light angle, check off whether you want the shadow to be crisp or dreamy, toggle contact hardening on or off, and select a motion personality like 'Smooth' or 'Snappy'. Our component reads these exact parameters.",
      contentNode: (
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-zinc-400 font-sans font-semibold">Design Handoff Token Sheet</span>
            <span className="text-amber-400 text-[11px]">Copy to Figma Card</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-300">
            <div>
              <span className="text-zinc-500">Lighting Parameters:</span>
              <p className="mt-1">Light Angle: <strong className="text-amber-300">Top-Right [-0.3, 0.4, 1.0]</strong></p>
              <p>Shadow Opacity: <strong className="text-sky-300">65%</strong></p>
              <p>Penumbra Softness: <strong className="text-purple-300">Soft (0.025)</strong></p>
              <p>Contact Hardening: <strong className="text-emerald-300">Enabled</strong></p>
            </div>
            <div>
              <span className="text-zinc-500">Motion Personality:</span>
              <p className="mt-1">Preset: <strong className="text-amber-300">Smooth (Editorial)</strong></p>
              <p>Ambient Sway: <strong className="text-emerald-300">Gentle Wind (Speed 0.7)</strong></p>
              <p>Scroll Parallax: <strong className="text-sky-300">30% Coupled</strong></p>
              <p>Sleep at Rest: <strong className="text-purple-300">Enabled (&lt; 2% CPU)</strong></p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      title: "Summary & Collaborative Workflow",
      subtitle: "Bringing Tactile Light to Our Next Release",
      category: "Next Steps",
      badge: "Slide 10 / 10",
      blueprint: `┌────────────────────────────────────────────────────────────────────────┐
│                           COLLABORATIVE WORKFLOW                       │
│   Step 1: Ideation & Substrate Selection                               │
│   Step 2: Token Calibration & Export                                   │
│   Step 3: Engineering Integration                                      │
│   Step 4: Live Interactive Review                                      │
│   Showcase Gallery: /showcase · Executive Benchmarks: /conclusions     │
└────────────────────────────────────────────────────────────────────────┘`,
      keyPoints: [
        "Uncompromised Design Fidelity: High-end organic ambiance without web performance, SEO, or battery trade-offs.",
        "99% Wire Bandwidth Savings: ~140KB total footprint replaces 30MB video loops.",
        "Live Interactive Showcase: Test out editorial, wood, and scroll scenarios right now at /showcase.",
        "Next Step: Select an upcoming landing page hero or editorial feature in our current sprint to pilot together.",
      ],
      speakerNotes:
        "To wrap up: with <ShadowBackground />, we no longer have to compromise our creative ambitions for web performance. We get living, breathing light and shadow at 60 FPS, with a tiny 140KB asset weight and 0.000 layout shift. The entire team can test out the live interactive demos right now at /showcase. Let's choose a feature in our next sprint to launch with this new capability. Thank you everyone, and let's open it up for questions!",
      contentNode: (
        <div className="flex flex-col items-center justify-center text-center p-6 gap-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white max-w-xl">
            Ready for Production Deployment
          </h3>
          <p className="text-sm text-zinc-400 max-w-lg">
            Explore live working examples, inspect shader performance, and review detailed
            benchmarks across our showcase routes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Showcase Gallery ↗</span>
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Read Engineering Guide ↗</span>
            </Link>
            <Link
              href="/conclusions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View Benchmarks ↗</span>
            </Link>
          </div>
        </div>
      ),
    },
  ];

export default function PresentationPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = SLIDES[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 relative font-sans selection:bg-purple-500/20 selection:text-purple-200 overflow-x-hidden ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      {!isFullscreen && <ShowcaseNav />}

      {/* Background Lighting Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-500/8 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex flex-col gap-6">
        {/* Top Deck Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {currentSlide.badge}
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              {currentSlide.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                showSpeakerNotes
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speaker Notes ({showSpeakerNotes ? "On" : "Off"})</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Presentation Slide Card */}
        <section
          data-testid="presentation-slide-card"
          className="relative bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm min-h-[520px] flex flex-col justify-between"
        >
          {/* Slide Header */}
          <div className="p-6 sm:p-8 border-b border-zinc-800/70 bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-purple-400 font-mono">
                {currentSlide.category}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Slide {currentSlide.id} of {SLIDES.length}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {currentSlide.title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{currentSlide.subtitle}</p>
          </div>

          {/* Slide Visual Content */}
          <div className="flex-1 flex flex-col justify-center">
            {currentSlide.contentNode}
          </div>

          {/* Key Talking Points Strip */}
          <div className="p-6 bg-zinc-950/60 border-t border-zinc-800/70">
            <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Slide Takeaways</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              {currentSlide.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Speaker Notes Drawer */}
        {showSpeakerNotes && (
          <aside
            data-testid="speaker-notes-panel"
            className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex flex-col gap-2 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Presenter Script &amp; Speaker Notes</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">Voice Track</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 font-serif italic leading-relaxed">
              &ldquo;{currentSlide.speakerNotes}&rdquo;
            </p>
          </aside>
        )}

        {/* Slide Deck Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Jump to slide ${slide.id}: ${slide.title}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  idx === currentSlideIndex
                    ? "w-8 bg-purple-400"
                    : "w-2 bg-zinc-800 hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>

          {/* Previous / Next Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              data-testid="prev-slide-btn"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 border border-zinc-800 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === SLIDES.length - 1}
              data-testid="next-slide-btn"
              className="inline-flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-600/20 transition active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
