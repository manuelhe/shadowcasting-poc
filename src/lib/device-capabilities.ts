/**
 * Device capability detection and Degradation Tier classification
 * Grounded in research findings from docs/research/zero-lcp-hydration.md
 */

export type DegradationTier = "static-poster" | "low-dynamic" | "full-dynamic";

export interface DeviceCapabilities {
  cores: number;
  isAppleDevice: boolean;
  isCoreClamped: boolean;
  deviceMemoryGb: number | null;
  prefersReducedMotion: boolean;
  saveData: boolean;
  effectiveConnectionType: string | null;
  hasWebGL2: boolean;
  webGlRenderer: string | null;
  recommendedTier: DegradationTier;
  reasons: string[];
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    return {
      cores: 4,
      isAppleDevice: false,
      isCoreClamped: false,
      deviceMemoryGb: null,
      prefersReducedMotion: false,
      saveData: false,
      effectiveConnectionType: null,
      hasWebGL2: false,
      webGlRenderer: null,
      recommendedTier: "static-poster",
      reasons: ["SSR Initial Render"],
    };
  }

  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const rawCores = nav.hardwareConcurrency || 2;
  const isApple = /Macintosh|iPhone|iPad|iPod/.test(nav.userAgent);
  // WebKit clamps hardwareConcurrency to 2 to prevent fingerprinting
  const isCoreClamped = isApple && rawCores <= 2;

  const deviceMemory = nav.deviceMemory ?? null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!nav.connection?.saveData;
  const effectiveConnectionType = nav.connection?.effectiveType ?? null;

  // WebGL 2 detection
  let hasWebGL2 = false;
  let webGlRenderer: string | null = null;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (gl) {
      hasWebGL2 = true;
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        webGlRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      } else {
        webGlRenderer = gl.getParameter(gl.RENDERER);
      }
    }
  } catch {
    hasWebGL2 = false;
  }

  // Tier Classification Logic
  const reasons: string[] = [];
  let tier: DegradationTier = "full-dynamic";

  if (prefersReducedMotion) {
    tier = "static-poster";
    reasons.push("prefers-reduced-motion enabled");
  } else if (saveData) {
    tier = "static-poster";
    reasons.push("Save-Data / data saver mode enabled");
  } else if (!hasWebGL2) {
    tier = "static-poster";
    reasons.push("No hardware-accelerated WebGL2 context");
  } else if (deviceMemory !== null && deviceMemory <= 2) {
    tier = "static-poster";
    reasons.push(`Low device memory (${deviceMemory}GB RAM)`);
  } else if (deviceMemory !== null && deviceMemory <= 4) {
    tier = "low-dynamic";
    reasons.push(`Moderate device memory (${deviceMemory}GB RAM)`);
  } else if (!isApple && rawCores <= 2) {
    tier = "low-dynamic";
    reasons.push(`Low CPU core count (${rawCores} cores)`);
  } else {
    reasons.push("High capability device: full WebGL dual-filtering enabled");
  }

  return {
    cores: rawCores,
    isAppleDevice: isApple,
    isCoreClamped,
    deviceMemoryGb: deviceMemory,
    prefersReducedMotion,
    saveData,
    effectiveConnectionType,
    hasWebGL2,
    webGlRenderer,
    recommendedTier: tier,
    reasons,
  };
}

let cachedCapabilities: DeviceCapabilities | null = null;

export function getCachedDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    return detectDeviceCapabilities();
  }
  if (!cachedCapabilities) {
    cachedCapabilities = detectDeviceCapabilities();
  }
  return cachedCapabilities;
}

export function clearDeviceCapabilitiesCache(): void {
  cachedCapabilities = null;
}

export function subscribeDeviceCapabilities(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  try {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      cachedCapabilities = detectDeviceCapabilities();
      callback();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    } else {
      const legacyQuery = mediaQuery as unknown as {
        addListener?: (cb: () => void) => void;
        removeListener?: (cb: () => void) => void;
      };
      if (typeof legacyQuery.addListener === "function") {
        legacyQuery.addListener(onChange);
        return () => legacyQuery.removeListener?.(onChange);
      }
    }
  } catch {
    // Media query not supported in environment
  }
  return () => {};
}
