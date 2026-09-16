"use client";

import React, { useRef, useEffect } from "react";
import {
  generateBranchSkeleton,
  swayBranchSkeleton,
  renderBranchToCanvas,
  BranchSkeleton,
} from "@/lib/procedural/branch-skeleton";

export interface ProceduralBranchProps {
  baseImage: string;
  shadowOpacity: number;
  blurRadius: number;
  windStrength: number;
  swaySpeed: number;
  branchDepth: number;
  leafDensity: number;
  onFrameStats?: (stats: { frameTimeMs: number; fps: number }) => void;
}

export function ProceduralBranchEngine({
  baseImage,
  shadowOpacity,
  blurRadius,
  windStrength,
  swaySpeed,
  branchDepth,
  leafDensity,
  onFrameStats,
}: ProceduralBranchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const skeletonRef = useRef<BranchSkeleton | null>(null);

  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  // Load base plate image
  useEffect(() => {
    const img = new window.Image();
    img.src = baseImage;
    img.onload = () => {
      baseImgRef.current = img;
    };
  }, [baseImage]);

  // Generate parametric branch skeleton when structural parameters change
  useEffect(() => {
    skeletonRef.current = generateBranchSkeleton({
      depth: branchDepth,
      trunkLength: 0.28,
      leafDensity,
      branchAngle: 0.52,
      origin: { x: 0.05, y: 0.05 },
    });
  }, [branchDepth, leafDensity]);

  // Main animation loop
  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();
    lastReportRef.current = lastTimeRef.current;
    const startTime = performance.now();

    const render = (now: number) => {
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

      const canvas = canvasRef.current;
      const baseImg = baseImgRef.current;
      const baseSkeleton = skeletonRef.current;

      if (canvas && baseImg && baseSkeleton) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear
          ctx.clearRect(0, 0, w, h);

          // 1. Draw base plate image
          ctx.drawImage(baseImg, 0, 0, w, h);

          // 2. Compute dynamic harmonic sway
          const elapsed = (now - startTime) / 1000;
          const swayed = swayBranchSkeleton(
            baseSkeleton,
            elapsed * swaySpeed,
            windStrength
          );

          // 3. Composite blurred shadow
          ctx.save();
          ctx.globalCompositeOperation = "multiply";
          ctx.globalAlpha = shadowOpacity;
          ctx.filter = `blur(${Math.max(1, blurRadius)}px)`;

          // Render branch vector silhouette
          renderBranchToCanvas(ctx, swayed, w, h, "#09090b");
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [windStrength, swaySpeed, shadowOpacity, blurRadius, onFrameStats]);

  // Handle canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
