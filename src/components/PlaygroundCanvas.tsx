"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { HarnessSettings } from "./DiagnosticHUD";
import {
  getCachedDeviceCapabilities,
  subscribeDeviceCapabilities,
  DegradationTier,
} from "@/lib/device-capabilities";
import { MousePointer, Wind, Layers, Sparkles } from "lucide-react";

interface PlaygroundCanvasProps {
  settings: HarnessSettings;
}

const getTierSnapshot = (): DegradationTier => getCachedDeviceCapabilities().recommendedTier;

export function PlaygroundCanvas({ settings }: PlaygroundCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const detectedTier = useSyncExternalStore<DegradationTier>(
    subscribeDeviceCapabilities,
    getTierSnapshot,
    () => "static-poster"
  );
  const effectiveTier = settings.forcedTier !== "auto" ? settings.forcedTier : detectedTier;

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [ambientAngle, setAmbientAngle] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  // Ambient motion loop (sway) using requestAnimationFrame
  useEffect(() => {
    if (effectiveTier === "static-poster") return;

    let rafId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Gentle 0.4Hz wind oscillation
      setAmbientAngle(elapsed * 0.8);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [effectiveTier]);

  // Pointer tracking for parallax interaction
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (effectiveTier === "static-poster") return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setMousePos({ x, y });
    setIsInteracting(true);
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    // Smoothly return to center
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // Interactive click handler to generate test events for INP measurement
  const handleInteractionClick = () => {
    setClickCount((c) => c + 1);
  };

  // Calculate dynamic shadow displacement
  // Sway displacement:
  const swayX = Math.sin(ambientAngle) * 18;
  const swayY = Math.cos(ambientAngle * 0.7) * 10;

  // Parallax displacement from pointer:
  const parallaxX = (mousePos.x - 0.5) * 60;
  const parallaxY = (mousePos.y - 0.5) * 45;

  const totalShadowX = effectiveTier === "static-poster" ? 20 : 20 + swayX + parallaxX;
  const totalShadowY = effectiveTier === "static-poster" ? 25 : 25 + swayY + parallaxY;

  // Penumbra blur radius:
  const blurRadius = effectiveTier === "low-dynamic" ? 8 : 16;

  // Container styling based on Viewport Preset
  const getContainerStyle = () => {
    switch (settings.viewportMode) {
      case "16:9":
        return "w-full max-w-5xl aspect-[16/9] mx-auto rounded-2xl shadow-xl";
      case "fixed-banner":
        return "w-[800px] h-[400px] mx-auto rounded-xl shadow-xl";
      case "mobile":
        return "w-[390px] h-[720px] mx-auto rounded-3xl shadow-2xl border-4 border-zinc-800";
      case "cover":
      default:
        return "w-full h-[640px] rounded-2xl shadow-2xl";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-6">
      {/* Viewport Container: Absolute Containment ensures 0.000 CLS */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative overflow-hidden bg-zinc-950 transition-all duration-300 select-none ${getContainerStyle()}`}
      >
        {/* Layer 0: Base Plate / Static Poster Fallback (SSR next/image with priority for zero LCP) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={settings.baseImage}
            alt="Hero Background Base Plate"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        {/* Layer 1: Shadow Caster & Synthesis Layer */}
        {effectiveTier === "static-poster" ? (
          /* Static Poster Tier: Simple CSS static shadow layer (0 JS CPU cost) */
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              transform: "translate(20px, 25px)",
              filter: "blur(12px)",
            }}
          >
            <Image
              src="/images/caster-branch.svg"
              alt="Static Shadow Silhouette"
              fill
              className="object-contain object-top-left"
            />
          </div>
        ) : (
          /* Dynamic Tier: Animated Shadow Caster with hardware-accelerated transform */
          <div
            className="absolute inset-0 z-10 pointer-events-none opacity-45 mix-blend-multiply transition-opacity duration-300 will-change-transform"
            style={{
              transform: `translate3d(${totalShadowX}px, ${totalShadowY}px, 0px) scale(${
                1 + Math.sin(ambientAngle * 0.5) * 0.02
              })`,
              filter: `blur(${blurRadius}px)`,
            }}
          >
            <Image
              src="/images/caster-branch.svg"
              alt="Dynamic Shadow Silhouette"
              fill
              className="object-contain object-top-left"
            />
          </div>
        )}

        {/* Layer 2: Foreground Content & INP Test Triggers */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-12 text-zinc-900 pointer-events-auto">
          {/* Top Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Active Tier:</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {effectiveTier.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs">
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                <Wind className="w-3.5 h-3.5" />
                <span>Ambient Sway:</span>
                <span className="font-mono font-semibold">
                  {effectiveTier === "static-poster" ? "Paused" : "Active"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                <MousePointer className="w-3.5 h-3.5" />
                <span>Parallax:</span>
                <span className="font-mono font-semibold">
                  {isInteracting ? "Tracking" : "Idle"}
                </span>
              </div>
            </div>
          </div>

          {/* Center Hero Callout */}
          <div className="max-w-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-white/60 dark:border-zinc-800 shadow-xl">
            <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-3">
              Interactive Test Section
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Organic Ambient Shadowcasting
            </h2>
            <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed">
              Move your cursor or touch to test parallax responsiveness. Click the button below to register interactive events and test <strong className="font-semibold text-zinc-900 dark:text-zinc-100">INP (Interaction to Next Paint)</strong> responsiveness in the Diagnostics HUD.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                id="inp-test-button"
                onClick={handleInteractionClick}
                className="px-5 py-2.5 rounded-xl font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition active:scale-95 shadow-md flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-sky-400 dark:text-sky-600" />
                <span>Trigger INP Interaction ({clickCount})</span>
              </button>

              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Tip: Increase CPU Stress in HUD to measure latency!
              </span>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="flex justify-between items-center text-xs text-zinc-700 dark:text-zinc-400 font-mono">
            <span>Viewport: {settings.viewportMode}</span>
            <span>
              Offset: X={Math.round(totalShadowX)}px, Y={Math.round(totalShadowY)}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
