"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";

export interface ShadowEngineProps {
  baseImage?: string;
  casterImage: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  shadowOpacity: number;
  shadowColor?: string;
  ambientScale: number;
  onFrameStats?: (stats: { frameTimeMs: number; fps: number }) => void;
}

export function CssShadowEngine({
  baseImage,
  casterImage,
  offsetX,
  offsetY,
  blurRadius,
  shadowOpacity,
  ambientScale,
  onFrameStats,
}: ShadowEngineProps) {
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();
    lastReportRef.current = lastTimeRef.current;
    const loop = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      frameCountRef.current++;

      if (now - lastReportRef.current >= 500) {
        const elapsed = (now - lastReportRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / elapsed);
        frameCountRef.current = 0;
        lastReportRef.current = now;
        onFrameStats?.({
          frameTimeMs: Math.round(delta * 10) / 10,
          fps,
        });
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [onFrameStats]);

  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden select-none",
        baseImage ? "bg-zinc-950" : "bg-transparent",
      ].join(" ")}
    >
      {/* Base Plate */}
      {baseImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={baseImage}
            alt="CSS Base Plate"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      )}

      {/* CSS Filter Shadow Caster */}
      <div
        className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply will-change-transform"
        style={{
          opacity: shadowOpacity,
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) scale(${ambientScale})`,
          filter: `blur(${blurRadius}px)`,
          transition: "filter 0.15s ease-out",
        }}
      >
        <Image
          src={casterImage}
          alt="CSS Shadow Caster"
          fill
          className="object-contain object-top-left"
        />
      </div>
    </div>
  );
}
