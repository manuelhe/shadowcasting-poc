"use client";

import React, { useRef, useEffect } from "react";
import { ShadowEngineProps } from "./CssShadowEngine";

export function Canvas2dShadowEngine({
  baseImage,
  casterImage,
  offsetX,
  offsetY,
  blurRadius,
  shadowOpacity,
  ambientScale,
  onFrameStats,
}: ShadowEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const casterImgRef = useRef<HTMLImageElement | null>(null);
  const imagesLoadedRef = useRef(false);

  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  // Load images
  useEffect(() => {
    imagesLoadedRef.current = false;
    let loadedCount = 0;

    const bImg = new window.Image();
    bImg.src = baseImage;
    bImg.onload = () => {
      loadedCount++;
      if (loadedCount === 2) imagesLoadedRef.current = true;
    };
    baseImgRef.current = bImg;

    const cImg = new window.Image();
    cImg.src = casterImage;
    cImg.onload = () => {
      loadedCount++;
      if (loadedCount === 2) imagesLoadedRef.current = true;
    };
    casterImgRef.current = cImg;
  }, [baseImage, casterImage]);

  // Main rendering loop
  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();
    lastReportRef.current = lastTimeRef.current;

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
      if (canvas && imagesLoadedRef.current && baseImgRef.current && casterImgRef.current) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear
          ctx.clearRect(0, 0, w, h);

          // 1. Draw base plate image
          ctx.drawImage(baseImgRef.current, 0, 0, w, h);

          // 2. Draw blurred shadow with multiply composite
          ctx.save();
          ctx.globalCompositeOperation = "multiply";
          ctx.globalAlpha = shadowOpacity;

          // Canvas 2D blur filter
          ctx.filter = `blur(${Math.max(1, blurRadius)}px)`;

          // Apply transform
          ctx.translate(offsetX, offsetY);
          ctx.scale(ambientScale, ambientScale);

          ctx.drawImage(casterImgRef.current, 0, 0, w, h);
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [offsetX, offsetY, blurRadius, shadowOpacity, ambientScale, onFrameStats]);

  // Handle canvas sizing to match container
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
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
