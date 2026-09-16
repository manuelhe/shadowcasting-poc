"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { WebGlShadowEngine } from "./engines/WebGlShadowEngine";
import { Canvas2dShadowEngine } from "./engines/Canvas2dShadowEngine";
import { ProceduralKomorebiEngine } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./engines/ProceduralBranchEngine";
import { useMotionController } from "../hooks/useMotionController";
import { SPRING_PRESETS, SpringConfig } from "../lib/motion/spring";
import { MotionOutput } from "../lib/motion/motion-controller";

/**
 * Pluggable Shadow Caster configuration discriminated union.
 */
export type ShadowCasterConfig =
  | { type: "image"; src: string; opacity?: number }
  | { type: "komorebi"; density?: number; contrast?: number; scale?: number; speed?: number }
  | { type: "branch"; depth?: number; leafDensity?: number; swaySpeed?: number };

/**
 * Degradation tiers for progressive enhancement.
 */
export type DegradationTier = "auto" | "force-static" | "force-dynamic";

/**
 * Calibrated spring motion behavior presets.
 */
export type MotionPreset = "smooth" | "snappy" | "inertial" | "bouncy" | "none";

/**
 * Spring physics, parallax, and ambient motion configuration for interactive shadowcasting.
 */
export interface MotionConfig {
  preset?: MotionPreset;
  stiffness?: number;
  damping?: number;
  mass?: number;
  ambient?: boolean;
  ambientSpeed?: number;
  ambientStrength?: number;
  maxDisplacementPx?: number;
  scrollInfluence?: boolean | number;
}

/**
 * Foundational props interface for <ShadowBackground />.
 */
export interface ShadowBackgroundProps {
  basePlate: string;
  poster?: string;
  caster: ShadowCasterConfig;
  degradation?: DegradationTier;
  penumbra?: number;
  contactHardening?: boolean;
  shadowOpacity?: number;
  lightDirection?: [number, number, number];
  fit?: "cover" | "contain" | "fill";
  motion?: MotionPreset | MotionConfig;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Evaluates client hardware capabilities and user preferences to determine
 * whether the component should remain on the Static Poster Fallback tier.
 */
export function evaluateHardwareGating(): boolean {
  if (typeof window === "undefined") return true;

  // 1. Accessibility: user preferred reduced motion
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return true;
  }

  const nav =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & {
          deviceMemory?: number;
          connection?: { saveData?: boolean };
        })
      : null;

  if (!nav) return false;

  // 2. Data saver mode enabled
  if (nav.connection?.saveData === true) {
    return true;
  }

  // 3. Low device memory (< 4GB RAM)
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) {
    return true;
  }

  // 4. Low CPU core count (< 4 cores), accounting for Safari / WebKit 2-core clamping
  const rawCores = typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : 4;
  const isApple =
    typeof nav.userAgent === "string" &&
    /Macintosh|iPhone|iPad|iPod/.test(nav.userAgent);
  const isCoreClamped = isApple && rawCores <= 2;
  if (!isCoreClamped && rawCores < 4) {
    return true;
  }

  return false;
}

/**
 * Probes for WebGL context creation support.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Resilient Error Boundary to catch runtime WebGL failures and trigger Canvas2D fallback.
 */
interface EngineErrorBoundaryProps {
  fallback: React.ReactNode;
  onError?: () => void;
  children: React.ReactNode;
}

interface EngineErrorBoundaryState {
  hasError: boolean;
}

export class EngineErrorBoundary extends React.Component<
  EngineErrorBoundaryProps,
  EngineErrorBoundaryState
> {
  constructor(props: EngineErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): EngineErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn("WebGL shadow engine error, degrading to Canvas2D fallback:", error);
    this.props.onError?.();
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Helper mapping boolean or numeric scroll influence into pixel shift value.
 */
export function resolveScrollInfluence(influence?: boolean | number): number {
  if (typeof influence === "boolean") {
    return influence ? 25 : 0;
  }
  if (typeof influence === "number") {
    return influence;
  }
  return 25;
}

/**
 * Parameters for resolving the dynamic shadow synthesis engine.
 */
export interface ResolveEngineOptions {
  caster: ShadowCasterConfig;
  basePlate: string;
  penumbra?: number;
  contactHardening?: boolean;
  shadowOpacity?: number;
  lightDirection?: [number, number, number];
  useCanvasFallback?: boolean;
  onWebGlError?: () => void;
  motionOutput?: MotionOutput;
}

/**
 * Resolves the dynamic shadow synthesis engine based on caster type, WebGL availability,
 * and dynamic motion state.
 */
export function resolveShadowEngine({
  caster,
  basePlate,
  penumbra = 24,
  contactHardening = true,
  shadowOpacity = 0.65,
  lightDirection = [20, 25, 1],
  useCanvasFallback = false,
  onWebGlError,
  motionOutput,
}: ResolveEngineOptions): React.ReactElement<Record<string, unknown>> {
  const isDynamicMotion = motionOutput != null;
  const offsetX = isDynamicMotion ? motionOutput.shadowOffsetX : lightDirection[0];
  const offsetY = isDynamicMotion ? motionOutput.shadowOffsetY : lightDirection[1];
  const effectivePenumbra = isDynamicMotion
    ? Math.round(penumbra * motionOutput.penumbraMultiplier)
    : penumbra;
  const windAngle = isDynamicMotion
    ? 45 + motionOutput.shadowOffsetX * 1.5
    : 45;
  const windStrength = isDynamicMotion
    ? 0.8 + Math.abs(motionOutput.shadowOffsetX) * 0.02
    : 0.8;

  switch (caster.type) {
    case "image": {
      const effectiveOpacity = caster.opacity ?? shadowOpacity;
      if (useCanvasFallback) {
        return (
          <Canvas2dShadowEngine
            baseImage={basePlate}
            casterImage={caster.src}
            offsetX={offsetX}
            offsetY={offsetY}
            blurRadius={effectivePenumbra}
            shadowOpacity={effectiveOpacity}
            ambientScale={1.0}
          />
        );
      }
      return (
        <EngineErrorBoundary
          onError={onWebGlError}
          fallback={
            <Canvas2dShadowEngine
              baseImage={basePlate}
              casterImage={caster.src}
              offsetX={offsetX}
              offsetY={offsetY}
              blurRadius={effectivePenumbra}
              shadowOpacity={effectiveOpacity}
              ambientScale={1.0}
            />
          }
        >
          <WebGlShadowEngine
            baseImage={basePlate}
            casterImage={caster.src}
            offsetX={offsetX}
            offsetY={offsetY}
            blurRadius={effectivePenumbra}
            shadowOpacity={effectiveOpacity}
            ambientScale={1.0}
            contactHardening={contactHardening}
          />
        </EngineErrorBoundary>
      );
    }

    case "komorebi": {
      return (
        <ProceduralKomorebiEngine
          basePlate={basePlate}
          shadowOpacity={shadowOpacity * (caster.density ?? 1.0)}
          scale={caster.scale ?? 3.5}
          speed={caster.speed ?? 0.5}
          contrast={caster.contrast ?? 1.2}
          windAngle={windAngle}
          mode={useCanvasFallback ? "cpu" : "gpu"}
        />
      );
    }

    case "branch": {
      return (
        <ProceduralBranchEngine
          basePlate={basePlate}
          shadowOpacity={shadowOpacity}
          penumbraRadius={effectivePenumbra}
          windStrength={windStrength}
          swaySpeed={caster.swaySpeed ?? 0.7}
          branchDepth={caster.depth ?? 4}
          leafDensity={caster.leafDensity ?? 5}
        />
      );
    }
  }
}

/**
 * <ShadowBackground />
 * Unified, performant, progressively enhanced Next.js background component.
 * Integrates zero-LCP static poster rendering, cooperative idle hydration,
 * hardware capability gating, and spring-damped interactive motion with 3D parallax.
 */
export function ShadowBackground({
  basePlate,
  poster,
  caster,
  degradation = "auto",
  penumbra = 24,
  contactHardening = true,
  shadowOpacity = 0.65,
  lightDirection = [20, 25, 1],
  fit = "cover",
  motion = "smooth",
  className,
  children,
}: ShadowBackgroundProps) {
  const [isDynamicMounted, setIsDynamicMounted] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  // 1. Resolve motion configuration & spring physics parameters
  const isMotionDisabled =
    motion === "none" ||
    (typeof motion === "object" && motion.preset === "none");

  const motionConfig: MotionConfig =
    typeof motion === "object" ? motion : { preset: motion ?? "smooth" };

  const activePreset = motionConfig.preset ?? "smooth";
  const baseSpring =
    activePreset !== "none" ? SPRING_PRESETS[activePreset] : SPRING_PRESETS.smooth;

  const resolvedSpring: SpringConfig = {
    stiffness: motionConfig.stiffness ?? baseSpring.stiffness,
    damping: motionConfig.damping ?? baseSpring.damping,
    mass: motionConfig.mass ?? baseSpring.mass,
  };

  const scrollInfluencePx = isMotionDisabled
    ? 0
    : resolveScrollInfluence(motionConfig.scrollInfluence);

  // 2. Wire headless motion controller
  const { output, handlers } = useMotionController({
    containerRef: stageRef,
    springConfig: resolvedSpring,
    maxDisplacementPx: motionConfig.maxDisplacementPx ?? 45,
    scrollInfluencePx,
    ambientMotion: !isMotionDisabled && (motionConfig.ambient ?? true),
    ambientSpeed: motionConfig.ambientSpeed ?? 0.8,
    ambientStrength: motionConfig.ambientStrength ?? 8,
  });

  // 3. Cooperative idle hydration & capability gating
  useEffect(() => {
    // 1. Force static: do not schedule dynamic mount
    if (degradation === "force-static") {
      return;
    }

    // 2. Auto mode: evaluate hardware gating and accessibility
    if (degradation === "auto") {
      const isLowTier = evaluateHardwareGating();
      if (isLowTier) {
        return;
      }
    }

    // 3. Cooperative idle hydration (requestIdleCallback with setTimeout fallback)
    let cancelled = false;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const mountDynamic = () => {
      if (!cancelled) {
        setWebGlSupported(isWebGLSupported());
        setIsDynamicMounted(true);
      }
    };

    if (
      typeof window !== "undefined" &&
      typeof window.requestIdleCallback === "function"
    ) {
      idleId = window.requestIdleCallback(mountDynamic, { timeout: 1000 });
    } else {
      timerId = setTimeout(mountDynamic, 100);
    }

    return () => {
      cancelled = true;
      if (
        idleId !== null &&
        typeof window !== "undefined" &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [degradation]);

  const effectivePoster = poster || basePlate;
  const fitClass =
    fit === "contain"
      ? "object-contain"
      : fit === "fill"
      ? "object-fill"
      : "object-cover";

  const isDynamicActive = degradation !== "force-static" && isDynamicMounted;
  const isMotionActive = isDynamicActive && !isMotionDisabled;

  return (
    <div
      ref={stageRef}
      className={["relative w-full h-full overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      data-fit={fit}
      data-motion-active={isMotionActive ? "true" : "false"}
      style={isMotionActive ? { touchAction: "none" } : undefined}
      {...(isMotionActive
        ? {
            onPointerMove: handlers.onPointerMove,
            onPointerLeave: handlers.onPointerLeave,
            onTouchStart: handlers.onTouchStart,
            onTouchMove: handlers.onTouchMove,
            onTouchEnd: handlers.onTouchEnd,
            onTouchCancel: handlers.onTouchCancel,
          }
        : {})}
    >
      {/* Background canvas / poster layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Static poster image: SSR-safe next/image with priority for zero LCP and 0.000 CLS */}
        <Image
          src={effectivePoster}
          alt=""
          fill
          priority
          sizes="100vw"
          className={fitClass}
          aria-hidden="true"
        />

        {/* Dynamic Shadow Synthesis Engine */}
        {isDynamicActive && (
          <div
            className="absolute inset-0 transition-opacity duration-300 transform-gpu"
            style={
              isMotionActive
                ? {
                    transform: `perspective(1000px) rotateX(${output.skewY}deg) rotateY(${output.skewX}deg)`,
                  }
                : undefined
            }
          >
            {resolveShadowEngine({
              caster,
              basePlate,
              penumbra,
              contactHardening,
              shadowOpacity,
              lightDirection,
              useCanvasFallback: !webGlSupported,
              onWebGlError: () => setWebGlSupported(false),
              motionOutput: isMotionActive ? output : undefined,
            })}
          </div>
        )}
      </div>

      {/* Foreground interactive content layer */}
      {children != null && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}
