"use client";

import React, { useRef, useEffect } from "react";
import {
  generateBranchSkeleton,
  swayBranchSkeleton,
  renderBranchToCanvas,
  BranchSkeleton,
} from "@/lib/procedural/branch-skeleton";

export interface ProceduralBranchProps {
  basePlate?: string;
  shadowColor?: string;
  shadowOpacity: number;
  penumbraRadius: number;
  windStrength: number;
  swaySpeed: number;
  branchDepth: number;
  leafDensity: number;
  onFrameStats?: (stats: {
    frameTimeMs: number;
    fps: number;
    memoryKb: number;
  }) => void;
}

export function ProceduralBranchEngine({
  basePlate,
  shadowColor = "#000000",
  shadowOpacity,
  penumbraRadius,
  windStrength,
  swaySpeed,
  branchDepth,
  leafDensity,
  onFrameStats,
}: ProceduralBranchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const skeletonRef = useRef<BranchSkeleton | null>(null);

  const propsRef = useRef({
    basePlate,
    shadowColor,
    shadowOpacity,
    penumbraRadius,
    windStrength,
    swaySpeed,
    branchDepth,
    leafDensity,
    onFrameStats,
  });

  useEffect(() => {
    propsRef.current = {
      basePlate,
      shadowColor,
      shadowOpacity,
      penumbraRadius,
      windStrength,
      swaySpeed,
      branchDepth,
      leafDensity,
      onFrameStats,
    };
  });

  const startTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);
  const execTimesRef = useRef<number[]>([]);

  // Load base plate image only when provided
  useEffect(() => {
    if (!basePlate) {
      baseImgRef.current = null;
      return;
    }
    const img = new window.Image();
    img.src = basePlate;
    img.onload = () => {
      baseImgRef.current = img;
    };
  }, [basePlate]);

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
    startTimeRef.current = performance.now();
    lastReportRef.current = startTimeRef.current;

    const render = (now: number) => {
      frameCountRef.current++;
      const currentProps = propsRef.current;
      const canvas = canvasRef.current;
      const baseImg = baseImgRef.current;
      const baseSkeleton = skeletonRef.current;

      const t0 = performance.now();

      if (canvas && baseSkeleton) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear to transparent
          ctx.clearRect(0, 0, w, h);

          // 1. Draw base plate if present
          if (currentProps.basePlate && baseImg) {
            ctx.drawImage(baseImg, 0, 0, w, h);
          }

          // 2. Compute dynamic harmonic sway
          const elapsed = (now - startTimeRef.current) / 1000;
          const swayed = swayBranchSkeleton(
            baseSkeleton,
            elapsed * currentProps.swaySpeed,
            currentProps.windStrength
          );

          // 3. Composite blurred shadow
          ctx.save();
          if (currentProps.basePlate && baseImg) {
            ctx.globalCompositeOperation = "multiply";
          }
          ctx.globalAlpha = currentProps.shadowOpacity;
          ctx.filter = `blur(${Math.max(1, currentProps.penumbraRadius)}px)`;

          // Render branch vector silhouette with shadowColor
          const branchColor = currentProps.shadowColor || "#09090b";
          renderBranchToCanvas(ctx, swayed, w, h, branchColor);
          ctx.restore();
        }
      }

      const execTime = performance.now() - t0;
      execTimesRef.current.push(execTime);

      // Report telemetry every 500ms
      if (now - lastReportRef.current >= 500) {
        const timeSpan = (now - lastReportRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / timeSpan);
        frameCountRef.current = 0;
        lastReportRef.current = now;

        const avgExec =
          execTimesRef.current.reduce((a, b) => a + b, 0) /
          Math.max(1, execTimesRef.current.length);
        execTimesRef.current = [];

        // Memory estimate: joints + leaves byte footprint
        const jointBytes = (baseSkeleton?.joints.length ?? 0) * 64;
        const leafBytes = (baseSkeleton?.leaves.length ?? 0) * 32;
        const memoryKb = Math.round(((jointBytes + leafBytes) / 1024) * 10) / 10;

        currentProps.onFrameStats?.({
          frameTimeMs: Math.round(avgExec * 100) / 100,
          fps,
          memoryKb,
        });
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
    <div
      className={[
        "relative w-full h-full overflow-hidden select-none",
        basePlate ? "bg-zinc-950" : "bg-transparent",
      ].join(" ")}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
