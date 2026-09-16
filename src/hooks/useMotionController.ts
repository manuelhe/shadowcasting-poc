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
    ambientSpeed = 0.8,
    ambientStrength = 8,
  } = options;

  const controllerRef = useRef<MotionController | null>(null);
  const isRunningRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const [output, setOutput] = useState<MotionOutput>(() => ({
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    x: 0,
    y: 0,
    penumbraMultiplier: 1.0,
    skewX: 0,
    skewY: 0,
    isAtRest: true,
    normalizedUV: { u: 0.5, v: 0.5 },
    rawPointer: { x: 0, y: 0 },
    scrollProgress: 0,
    scrollDeltaY: 0,
    virtualLightDirection: { x: 0, y: 0, z: 1 },
  }));

  // Keep controller instance alive (React 19 ref initialization pattern)
  if (controllerRef.current == null) {
    controllerRef.current = new MotionController({
      springConfig,
      maxDisplacementPx,
      lightElevation,
      scrollInfluencePx,
      ambientMotion,
      ambientSpeed,
      ambientStrength,
    });
  }

  // Wake up animation loop
  const wakeUpLoop = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.064);
      lastTime = now;

      const controller = controllerRef.current;
      if (controller) {
        controller.step(dt);
        const nextOutput = controller.getOutput();
        setOutput(nextOutput);

        // If at rest and ambient motion is inactive, sleep to conserve power
        if (nextOutput.isAtRest) {
          isRunningRef.current = false;
          rafIdRef.current = null;
          return;
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, []);

  // Update dynamic options on change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setSpringConfig(springConfig);
      controllerRef.current.setAmbientMotion(ambientMotion);
    }
    // Ambient motion requires continuous loop
    wakeUpLoop();
  }, [springConfig, ambientMotion, wakeUpLoop]);

  // Event handlers with stable callbacks
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current) return;
    const rect = el.getBoundingClientRect();
    controllerRef.current.handlePointerMove(e.clientX, e.clientY, rect);
    wakeUpLoop();
  }, [containerRef, wakeUpLoop]);

  const handlePointerLeave = useCallback(() => {
    controllerRef.current?.handlePointerLeave();
    wakeUpLoop();
  }, [wakeUpLoop]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    controllerRef.current.handleTouchStart(touch.clientX, touch.clientY, rect);
    wakeUpLoop();
  }, [containerRef, wakeUpLoop]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el || !controllerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    controllerRef.current.handleTouchMove(touch.clientX, touch.clientY, rect);
    wakeUpLoop();
  }, [containerRef, wakeUpLoop]);

  const handleTouchEnd = useCallback(() => {
    controllerRef.current?.handleTouchEnd();
    wakeUpLoop();
  }, [wakeUpLoop]);

  const handleTouchCancel = useCallback(() => {
    controllerRef.current?.handleTouchCancel();
    wakeUpLoop();
  }, [wakeUpLoop]);

  // Window scroll listener (passive)
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      controllerRef.current?.handleScroll(scrollY, maxScroll);
      wakeUpLoop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [wakeUpLoop]);

  // Cleanup on unmount
  useEffect(() => {
    wakeUpLoop();
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isRunningRef.current = false;
    };
  }, [wakeUpLoop]);

  return {
    output,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
