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

export interface NormalizePointerOptions {
  clamp?: boolean;
}

/**
 * Normalizes client coordinates relative to an element rectangle.
 * Element center maps to (0, 0), top-left to (-1, -1), bottom-right to (1, 1).
 */
export function normalizePointer(
  clientX: number,
  clientY: number,
  rect: RectLike,
  options?: NormalizePointerOptions
): Vector2 {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  // Center-relative normalized coords [-1..1]
  let nx = (relX / rect.width) * 2 - 1;
  let ny = (relY / rect.height) * 2 - 1;

  if (options?.clamp) {
    nx = Math.max(-1, Math.min(1, nx));
    ny = Math.max(-1, Math.min(1, ny));
  }

  return { x: nx, y: ny };
}

/**
 * Normalizes window or container scroll position to a [0..1] range.
 */
export function normalizeScroll(scrollY: number, maxScroll: number): number {
  if (maxScroll <= 0) {
    return 0;
  }
  const progress = scrollY / maxScroll;
  return Math.max(0, Math.min(1, progress));
}

export interface VirtualLightOptions {
  normalizedPointer: Vector2;
  scrollProgress: number;
  maxDisplacementPx: number;
  lightElevation?: number; // 0.1 to 3.0 (higher = softer penumbra)
  scrollInfluence?: number; // Pixel shift per unit scroll
}

export interface VirtualLightResult {
  shadowX: number;
  shadowY: number;
  penumbraMultiplier: number;
  lightDirection: { x: number; y: number; z: number };
}

/**
 * Computes 2D cast shadow displacement and penumbra multiplier
 * from normalized pointer, scroll progress, and virtual light elevation.
 */
export function computeVirtualLightOffset(options: VirtualLightOptions): VirtualLightResult {
  const {
    normalizedPointer,
    scrollProgress,
    maxDisplacementPx,
    lightElevation = 1.0,
    scrollInfluence = 20,
  } = options;

  // A light positioned at pointer (nx, ny) casts shadows in the OPPOSITE direction.
  // When pointer is at top-left (-1, -1), light is at (-1, -1) and shadow projects (+x, +y).
  const dirX = -normalizedPointer.x;
  const dirY = -normalizedPointer.y;

  // Scroll shifts the vertical angle of light downwards
  const scrollShift = (scrollProgress - 0.5) * scrollInfluence;

  const shadowX = dirX * maxDisplacementPx;
  const shadowY = dirY * maxDisplacementPx + scrollShift;

  // Penumbra spreads out when light elevation is higher or caster is further from base plate
  const penumbraMultiplier = Math.max(0.2, lightElevation * 1.2);

  return {
    shadowX,
    shadowY,
    penumbraMultiplier,
    lightDirection: {
      x: normalizedPointer.x,
      y: normalizedPointer.y,
      z: lightElevation,
    },
  };
}
