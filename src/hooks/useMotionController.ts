"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MotionController,
  MotionControllerOptions,
  MotionOutput,
} from "@/lib/motion/motion-controller";
import { SPRING_PRESETS } from "@/lib/motion/spring";

export interface UseMotionControllerOptions extends MotionControllerOptions {
  containerRef: React.RefObject<HTMLElement | null>;
}

export function useMotionController(options: UseMotionControllerOptions) {
  const {
    containerRef,
    springConfig = SPRING_PRESETS.smooth,
    maxDisplacementPx = 45,
    lightElevation = 1.0,
    scrollInfluencePx = 25,
    ambientMotion = true,
    ambientWindSpeed = 0.8,
    ambientWindStrength = 8,
  } = options;

  const controllerRef = useRef<MotionController | null>(null);
  const [output, setOutput] = useState<MotionOutput>(() => ({
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    penumbraMultiplier: 1.0,
    skewX: 0,
    skewY: 0,
    isAtRest: true,
    rawPointer: { x: 0, y: 0 },
    scrollProgress: 0,
  }));

  // Keep controller instance alive (React 19 ref initialization pattern)
  if (controllerRef.current == null) {
    controllerRef.current = new MotionController({
      springConfig,
      maxDisplacementPx,
      lightElevation,
      scrollInfluencePx,
      ambientMotion,
      ambientWindSpeed,
      ambientWindStrength,
    });
  }

  // Update dynamic options on change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setSpringConfig(springConfig);
      controllerRef.current.setAmbientMotion(ambientMotion);
    }
  }, [springConfig, ambientMotion]);

  // Event handlers with stable callbacks
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current) return;
    const rect = el.getBoundingClientRect();
    controllerRef.current.handlePointerMove(e.clientX, e.clientY, rect);
  }, [containerRef]);

  const handlePointerLeave = useCallback(() => {
    controllerRef.current?.handlePointerLeave();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    controllerRef.current.handleTouchStart(touch.clientX, touch.clientY, rect);
  }, [containerRef]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    controllerRef.current.handleTouchMove(touch.clientX, touch.clientY, rect);
  }, [containerRef]);

  const handleTouchEnd = useCallback(() => {
    controllerRef.current?.handleTouchEnd();
  }, []);

  // Window scroll listener (passive)
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      controllerRef.current?.handleScroll(scrollY, maxScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animation rAF loop
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.064);
      lastTime = now;

      const controller = controllerRef.current;
      if (controller) {
        controller.step(dt);
        setOutput(controller.getOutput());
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return {
    output,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
