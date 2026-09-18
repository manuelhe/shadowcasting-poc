"use client";

import React, { useRef, useEffect } from "react";
import { ShadowEngineProps } from "./CssShadowEngine";

export interface Canvas2dShadowEngineProps extends ShadowEngineProps {
  contactPoint?: [number, number];
}

export function Canvas2dShadowEngine({
  baseImage,
  casterImage,
  offsetX,
  offsetY,
  blurRadius,
  shadowOpacity,
  shadowColor = "#000000",
  ambientScale,
  contactPoint: _contactPoint,
  onFrameStats,
}: Canvas2dShadowEngineProps) {
  void _contactPoint;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const casterImgRef = useRef<HTMLImageElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const imagesLoadedRef = useRef(false);

  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  // Load images
  useEffect(() => {
    imagesLoadedRef.current = false;
    let loadedCount = 0;
    const requiredCount = baseImage ? 2 : 1;

    if (baseImage) {
      const bImg = new window.Image();
      bImg.src = baseImage;
      bImg.onload = () => {
        loadedCount++;
        if (loadedCount === requiredCount) imagesLoadedRef.current = true;
      };
      baseImgRef.current = bImg;
    } else {
      baseImgRef.current = null;
    }

    const cImg = new window.Image();
    cImg.src = casterImage;
    cImg.onload = () => {
      loadedCount++;
      if (loadedCount === requiredCount) imagesLoadedRef.current = true;
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
      if (canvas && imagesLoadedRef.current && casterImgRef.current) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear to transparent
          ctx.clearRect(0, 0, w, h);

          if (baseImage && baseImgRef.current) {
            // 1. Draw base plate image
            ctx.drawImage(baseImgRef.current, 0, 0, w, h);

            // 2. Draw blurred shadow with multiply composite
            ctx.save();
            ctx.globalCompositeOperation = "multiply";
            ctx.globalAlpha = shadowOpacity;
            ctx.filter = `blur(${Math.max(1, blurRadius)}px)`;
            ctx.translate(offsetX, offsetY);
            ctx.scale(ambientScale, ambientScale);
            ctx.drawImage(casterImgRef.current, 0, 0, w, h);
            ctx.restore();
          } else {
            // Zero-base transparent alpha mode
            ctx.save();
            ctx.fillStyle = shadowColor || "#000000";
            ctx.globalAlpha = shadowOpacity;
            ctx.filter = `blur(${Math.max(1, blurRadius)}px)`;
            ctx.translate(offsetX, offsetY);
            ctx.scale(ambientScale, ambientScale);

            // Draw caster silhouette tinted with shadowColor onto transparent canvas
            if (!offscreenRef.current && typeof document !== "undefined") {
              offscreenRef.current = document.createElement("canvas");
            }
            const offscreen = offscreenRef.current;
            if (offscreen) {
              if (offscreen.width !== w || offscreen.height !== h) {
                offscreen.width = w;
                offscreen.height = h;
              }
              const offCtx = offscreen.getContext("2d");
              if (offCtx) {
                offCtx.clearRect(0, 0, w, h);
                offCtx.drawImage(casterImgRef.current, 0, 0, w, h);
                offCtx.globalCompositeOperation = "source-in";
                offCtx.fillStyle = shadowColor || "#000000";
                offCtx.fillRect(0, 0, w, h);
                ctx.drawImage(offscreen, 0, 0, w, h);
              } else {
                ctx.drawImage(casterImgRef.current, 0, 0, w, h);
              }
            } else {
              ctx.drawImage(casterImgRef.current, 0, 0, w, h);
            }
            ctx.restore();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [
    baseImage,
    casterImage,
    offsetX,
    offsetY,
    blurRadius,
    shadowOpacity,
    shadowColor,
    ambientScale,
    onFrameStats,
  ]);

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
    <div
      className={[
        "relative w-full h-full overflow-hidden select-none",
        baseImage ? "bg-zinc-950" : "bg-transparent",
      ].join(" ")}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
