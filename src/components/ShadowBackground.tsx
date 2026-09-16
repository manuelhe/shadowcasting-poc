"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { WebGlShadowEngine } from "./engines/WebGlShadowEngine";
import { Canvas2dShadowEngine } from "./engines/Canvas2dShadowEngine";
import { ProceduralKomorebiEngine } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./engines/ProceduralBranchEngine";
import { useMotionController } from "../hooks/useMotionController";
import { SPRING_PRESETS, SpringConfig } from "../lib/motion/spring";
import { MotionOutput } from "../lib/motion/motion-controller";
import { detectDeviceCapabilities } from "../lib/device-capabilities";

/**
 * Pluggable Shadow Caster configuration discriminated union.
 */
export type ShadowCasterConfig =
  | { type: "image"; src: string; opacity?: number }
  | { type: "komorebi"; density?: number; contrast?: number; scale?: number; speed?: number }
  | { type: "branch"; depth?: number; leafDensity?: number; swaySpeed?: number };

/**
 * Degradation tiers for progressive enhancement.
 * Supports canonical and force overrides seamlessly.
 */
export type DegradationTier =
  | "auto"
  | "static-poster"
  | "low-dynamic"
  | "full-dynamic"
  | "force-static"
  | "force-dynamic";

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
  ambientMotion?: boolean;
  ambientSpeed?: number;
  ambientStrength?: number;
  maxDisplacementPx?: number;
  scrollInfluence?: boolean | number;
}

/**
 * Foundational props interface for <ShadowBackground />.
 * Extends React.HTMLAttributes<HTMLDivElement> so standard HTML attributes
 * (id, role, style, data-*, aria-*, etc.) are forwarded cleanly to the root <div>.
 */
export interface ShadowBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  basePlate: string;
  poster?: string;
  caster: ShadowCasterConfig;
  tier?: DegradationTier;
  degradation?: DegradationTier;
  penumbra?: number;
  contactHardening?: boolean;
  shadowOpacity?: number;
  lightDirection?: [number, number, number];
  fit?: "cover" | "contain" | "fill";
  motion?: MotionPreset | MotionConfig;
  blendMode?: "multiply" | "normal";
  onTierChange?: (tier: string) => void;
  onRest?: () => void;
  onWake?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Safe wrapper around detectDeviceCapabilities ensuring window.navigator and window.matchMedia
 * are consistently aligned in test and non-browser DOM environments.
 */
function safelyDetectDeviceCapabilities() {
  if (typeof window === "undefined") {
    return detectDeviceCapabilities();
  }
  if (typeof navigator !== "undefined" && !window.navigator) {
    try {
      Object.defineProperty(window, "navigator", {
        value: navigator,
        configurable: true,
        writable: true,
      });
    } catch {
      // ignore
    }
  }
  if (typeof window.matchMedia !== "function") {
    try {
      window.matchMedia = (() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
    } catch {
      // ignore
    }
  }
  return detectDeviceCapabilities();
}

/**
 * Evaluates client hardware capabilities and user preferences to determine
 * whether the component should remain on the Static Poster Fallback tier.
 */
export function evaluateHardwareGating(): boolean {
  if (typeof window === "undefined") return true;

  const caps = safelyDetectDeviceCapabilities();

  // 1. Accessibility: user preferred reduced motion
  // 2. Data saver mode enabled
  if (caps.prefersReducedMotion || caps.saveData) {
    return true;
  }

  // 3. Low device memory (< 4GB RAM)
  if (caps.deviceMemoryGb !== null && caps.deviceMemoryGb < 4) {
    return true;
  }

  // 4. Low CPU core count (< 4 cores), accounting for Safari / WebKit 2-core clamping
  if (!caps.isCoreClamped && caps.cores < 4) {
    return true;
  }

  return false;
}

/**
 * Helper constructing the Canvas2D shadow engine fallback element.
 */
export function renderCanvas2dFallback(
  basePlate: string,
  casterSrc: string,
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  shadowOpacity: number,
  ambientScale = 1.0
): React.ReactElement<Record<string, unknown>> {
  return (
    <Canvas2dShadowEngine
      baseImage={basePlate}
      casterImage={casterSrc}
      offsetX={offsetX}
      offsetY={offsetY}
      blurRadius={blurRadius}
      shadowOpacity={shadowOpacity}
      ambientScale={ambientScale}
    />
  );
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
      const canvasFallback = renderCanvas2dFallback(
        basePlate,
        caster.src,
        offsetX,
        offsetY,
        effectivePenumbra,
        effectiveOpacity
      );

      if (useCanvasFallback) {
        return canvasFallback;
      }
      return (
        <EngineErrorBoundary
          onError={onWebGlError}
          fallback={canvasFallback}
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
export const ShadowBackground = React.forwardRef<
  HTMLDivElement,
  ShadowBackgroundProps
>(function ShadowBackground(
  {
    basePlate,
    poster,
    caster,
    tier,
    degradation,
    penumbra = 24,
    contactHardening = true,
    shadowOpacity = 0.65,
    lightDirection = [20, 25, 1],
    fit = "cover",
    motion = "smooth",
    blendMode = "multiply",
    onTierChange,
    onRest,
    onWake,
    className,
    children,
    style,
    ...restProps
  }: ShadowBackgroundProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [isDynamicMounted, setIsDynamicMounted] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  const setMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (stageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const effectiveTier = tier ?? degradation ?? "auto";

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

  const resolvedAmbientMotion =
    !isMotionDisabled && (motionConfig.ambientMotion ?? motionConfig.ambient ?? true);

  // 2. Wire headless motion controller
  const { output, handlers } = useMotionController({
    containerRef: stageRef,
    springConfig: resolvedSpring,
    maxDisplacementPx: motionConfig.maxDisplacementPx ?? 45,
    scrollInfluencePx,
    ambientMotion: resolvedAmbientMotion,
    ambientSpeed: motionConfig.ambientSpeed ?? 0.8,
    ambientStrength: motionConfig.ambientStrength ?? 8,
  });

  // 3. Track rest / wake lifecycle transitions
  const wasAtRestRef = useRef(true);

  useEffect(() => {
    if (output.isAtRest && !wasAtRestRef.current) {
      wasAtRestRef.current = true;
      onRest?.();
    } else if (!output.isAtRest && wasAtRestRef.current) {
      wasAtRestRef.current = false;
      onWake?.();
    }
  }, [output.isAtRest, onRest, onWake]);

  const handlePointerInteraction = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (wasAtRestRef.current) {
        wasAtRestRef.current = false;
        onWake?.();
      }
      handlers.onPointerMove(e);
    },
    [handlers, onWake]
  );

  // 4. Cooperative idle hydration & capability gating
  useEffect(() => {
    // 1. Force static / static poster: do not schedule dynamic mount
    if (effectiveTier === "force-static" || effectiveTier === "static-poster") {
      onTierChange?.("static-poster");
      return;
    }

    // 2. Auto mode: evaluate hardware gating and accessibility
    let targetTier: "full-dynamic" | "low-dynamic" | "static-poster" = "full-dynamic";

    if (effectiveTier === "auto") {
      const caps = safelyDetectDeviceCapabilities();
      if (caps.recommendedTier === "static-poster" || evaluateHardwareGating()) {
        onTierChange?.("static-poster");
        return;
      }
      targetTier = caps.recommendedTier === "low-dynamic" ? "low-dynamic" : "full-dynamic";
    } else if (effectiveTier === "low-dynamic") {
      targetTier = "low-dynamic";
    } else {
      targetTier = "full-dynamic";
    }

    // 3. Cooperative idle hydration (requestIdleCallback with setTimeout fallback)
    let cancelled = false;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const mountDynamic = () => {
      if (!cancelled) {
        const hasWebGl = isWebGLSupported();
        setWebGlSupported(hasWebGl);
        setIsDynamicMounted(true);
        const resolved =
          targetTier === "low-dynamic" || !hasWebGl ? "low-dynamic" : "full-dynamic";
        onTierChange?.(resolved);
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
  }, [effectiveTier, onTierChange]);

  const effectivePoster = poster || basePlate;
  const fitClass =
    fit === "contain"
      ? "object-contain"
      : fit === "fill"
      ? "object-fill"
      : "object-cover";

  const isDynamicActive =
    effectiveTier !== "force-static" &&
    effectiveTier !== "static-poster" &&
    isDynamicMounted;
  const isMotionActive = isDynamicActive && !isMotionDisabled;

  const containerStyle: React.CSSProperties = {
    ...(style as React.CSSProperties),
    ...(isMotionActive ? { touchAction: "pan-y" } : {}),
  };

  return (
    <div
      ref={setMergedRef}
      className={["relative w-full h-full overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      data-fit={fit}
      data-motion-active={isMotionActive ? "true" : "false"}
      data-blend-mode={blendMode}
      style={containerStyle}
      {...(isMotionActive
        ? {
            onPointerDown: handlePointerInteraction,
            onPointerMove: handlePointerInteraction,
            onPointerLeave: handlers.onPointerLeave,
            onPointerUp: handlers.onPointerLeave,
            onPointerCancel: handlers.onPointerLeave,
          }
        : {})}
      {...restProps}
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
            style={{
              mixBlendMode: blendMode,
              ...(isMotionActive
                ? {
                    transform: `perspective(1000px) rotateX(${output.skewY}deg) rotateY(${output.skewX}deg)`,
                  }
                : {}),
            }}
          >
            {resolveShadowEngine({
              caster,
              basePlate,
              penumbra,
              contactHardening,
              shadowOpacity,
              lightDirection,
              useCanvasFallback: effectiveTier === "low-dynamic" || !webGlSupported,
              onWebGlError: () => {
                setWebGlSupported(false);
                onTierChange?.("low-dynamic");
              },
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
});

ShadowBackground.displayName = "ShadowBackground";
