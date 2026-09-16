"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { WebGlShadowEngine } from "./engines/WebGlShadowEngine";
import { Canvas2dShadowEngine } from "./engines/Canvas2dShadowEngine";
import { ProceduralKomorebiEngine } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./engines/ProceduralBranchEngine";

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
}

/**
 * Resolves the dynamic shadow synthesis engine based on caster type and WebGL availability.
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
}: ResolveEngineOptions): React.ReactElement<Record<string, unknown>> {
  const [offsetX, offsetY] = lightDirection;

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
            blurRadius={penumbra}
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
              blurRadius={penumbra}
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
            blurRadius={penumbra}
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
          windAngle={45}
          mode={useCanvasFallback ? "cpu" : "gpu"}
        />
      );
    }

    case "branch": {
      return (
        <ProceduralBranchEngine
          basePlate={basePlate}
          shadowOpacity={shadowOpacity}
          penumbraRadius={penumbra}
          windStrength={0.8}
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
 * Foundational component providing zero-LCP static poster rendering,
 * cooperative idle hydration, hardware capability gating, and adaptive engine resolution.
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
  className,
  children,
}: ShadowBackgroundProps) {
  const [isDynamicMounted, setIsDynamicMounted] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

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
      typeof (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback === "function"
    ) {
      idleId = (
        window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }
      ).requestIdleCallback(mountDynamic, { timeout: 1000 });
    } else {
      timerId = setTimeout(mountDynamic, 100);
    }

    return () => {
      cancelled = true;
      if (
        idleId !== null &&
        typeof window !== "undefined" &&
        typeof (window as unknown as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback === "function"
      ) {
        (
          window as unknown as { cancelIdleCallback: (id: number) => void }
        ).cancelIdleCallback(idleId);
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

  return (
    <div
      className={["relative w-full h-full overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      data-fit={fit}
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
          <div className="absolute inset-0 transition-opacity duration-300">
            {resolveShadowEngine({
              caster,
              basePlate,
              penumbra,
              contactHardening,
              shadowOpacity,
              lightDirection,
              useCanvasFallback: !webGlSupported,
              onWebGlError: () => setWebGlSupported(false),
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
