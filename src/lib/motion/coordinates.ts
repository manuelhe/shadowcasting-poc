/**
 * Coordinate Normalization & Virtual Light Direction Utilities
 */

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface NormalizedUV {
  u: number; // [0..1] from top-left
  v: number; // [0..1] from top-left
}

export interface NormalizedPointerResult {
  centered: Vector2;   // [-1..1] with (0,0) at element center
  uv: NormalizedUV;    // [0..1] with (0,0) at top-left
}

export interface NormalizePointerOptions {
  clamp?: boolean;
}

/**
 * Normalizes client coordinates relative to an element rectangle.
 * Computes both center-relative [-1..1] vector and normalized [0..1] UV coordinates.
 */
export function normalizePointer(
  clientX: number,
  clientY: number,
  rect: RectLike,
  options?: NormalizePointerOptions
): NormalizedPointerResult {
  if (rect.width <= 0 || rect.height <= 0) {
    return {
      centered: { x: 0, y: 0 },
      uv: { u: 0.5, v: 0.5 },
    };
  }

  const relativeX = clientX - rect.left;
  const relativeY = clientY - rect.top;

  let u = relativeX / rect.width;
  let v = relativeY / rect.height;

  // Center-relative normalized coords [-1..1]
  let normalizedX = u * 2 - 1;
  let normalizedY = v * 2 - 1;

  if (options?.clamp) {
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, v));
    normalizedX = Math.max(-1, Math.min(1, normalizedX));
    normalizedY = Math.max(-1, Math.min(1, normalizedY));
  }

  return {
    centered: { x: normalizedX, y: normalizedY },
    uv: { u, v },
  };
}

export interface ScrollState {
  progress: number;   // [0..1]
  deltaY: number;     // Instantaneous scroll delta
}

/**
 * Normalizes window or container scroll position to a [0..1] progress and tracks deltas.
 */
export function normalizeScroll(
  scrollY: number,
  maxScroll: number,
  previousScrollY = 0
): ScrollState {
  if (maxScroll <= 0) {
    return { progress: 0, deltaY: 0 };
  }
  const rawProgress = scrollY / maxScroll;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const deltaY = scrollY - previousScrollY;

  return { progress, deltaY };
}

export interface VirtualLight3D {
  x: number;
  y: number;
  z: number;
}

export interface VirtualLightOptions {
  normalizedPointer: Vector2;
  scrollProgress: number;
  maxDisplacementPx: number;
  lightElevation?: number; // 0.1 to 3.0 (higher = softer penumbra)
  scrollInfluencePx?: number; // Pixel shift per unit scroll
}

export interface VirtualLightResult {
  shadowOffsetX: number;
  shadowOffsetY: number;
  penumbraMultiplier: number;
  virtualLightDirection: VirtualLight3D;
}

/**
 * Computes 2D cast shadow displacement, 3D virtual light direction, and penumbra multiplier
 * from normalized pointer, scroll progress, and light elevation.
 */
export function computeVirtualLightOffset(options: VirtualLightOptions): VirtualLightResult {
  const {
    normalizedPointer,
    scrollProgress,
    maxDisplacementPx,
    lightElevation = 1.0,
    scrollInfluencePx = 25,
  } = options;

  // Light at pointer (x, y) casts shadows in the OPPOSITE direction
  const shadowDirectionX = -normalizedPointer.x;
  const shadowDirectionY = -normalizedPointer.y;

  // Vertical light elevation shift from scroll progress
  const scrollShift = scrollProgress * scrollInfluencePx;

  const shadowOffsetX = shadowDirectionX * maxDisplacementPx;
  const shadowOffsetY = shadowDirectionY * maxDisplacementPx + scrollShift;

  // Penumbra spreads out when light elevation is higher or caster is further from base plate
  const penumbraMultiplier = Math.max(0.2, lightElevation * 1.2);

  // 3D unit direction vector towards light source
  const len = Math.sqrt(
    normalizedPointer.x ** 2 + normalizedPointer.y ** 2 + lightElevation ** 2
  );
  const invLen = len > 0 ? 1 / len : 1;

  const virtualLightDirection: VirtualLight3D = {
    x: normalizedPointer.x * invLen,
    y: normalizedPointer.y * invLen,
    z: lightElevation * invLen,
  };

  return {
    shadowOffsetX,
    shadowOffsetY,
    penumbraMultiplier,
    virtualLightDirection,
  };
}
