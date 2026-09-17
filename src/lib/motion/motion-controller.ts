/**
 * Headless Motion Controller
 * Unifies pointer parallax, scroll elevation tilt, touch interactions,
 * and ambient motion through a second-order spring physics solver.
 */

import {
  RectLike,
  Vector2,
  NormalizedUV,
  VirtualLight3D,
  normalizePointer,
  normalizeScroll,
  computeVirtualLightOffset,
} from "./coordinates";
import {
  SpringConfig,
  SpringState2D,
  SPRING_PRESETS,
  stepSpring2D,
  isSpringAtRest2D,
} from "./spring";

export interface MotionControllerOptions {
  springConfig?: SpringConfig;
  maxDisplacementPx?: number;
  lightElevation?: number;
  scrollInfluencePx?: number;
  ambientMotion?: boolean;
  ambientSpeed?: number;
  ambientStrength?: number;
}

export interface MotionOutput {
  shadowOffsetX: number;
  shadowOffsetY: number;
  x?: number;
  y?: number;
  penumbraMultiplier: number;
  skewX: number;
  skewY: number;
  isAtRest: boolean;
  normalizedUV: NormalizedUV;
  rawPointer: Vector2;
  scrollProgress: number;
  scrollDeltaY: number;
  virtualLightDirection: VirtualLight3D;
}

export class MotionController {
  private options: Required<MotionControllerOptions>;
  private springState: SpringState2D;
  private targetPointer: Vector2;
  private targetUV: NormalizedUV;
  private scrollProgress: number;
  private scrollDeltaY: number;
  private previousScrollY: number;
  private ambientTime: number;
  private isTouching: boolean;

  constructor(options?: MotionControllerOptions) {
    this.options = {
      springConfig: options?.springConfig ?? SPRING_PRESETS.smooth,
      maxDisplacementPx: options?.maxDisplacementPx ?? 45,
      lightElevation: options?.lightElevation ?? 1.0,
      scrollInfluencePx: options?.scrollInfluencePx ?? 25,
      ambientMotion: options?.ambientMotion ?? true,
      ambientSpeed: options?.ambientSpeed ?? 0.8,
      ambientStrength: options?.ambientStrength ?? 8,
    };

    this.springState = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    };

    this.targetPointer = { x: 0, y: 0 };
    this.targetUV = { u: 0.5, v: 0.5 };
    this.scrollProgress = 0;
    this.scrollDeltaY = 0;
    this.previousScrollY = 0;
    this.ambientTime = 0;
    this.isTouching = false;
  }

  public setSpringConfig(config: SpringConfig): void {
    this.options.springConfig = config;
  }

  public setAmbientMotion(enabled: boolean): void {
    this.options.ambientMotion = enabled;
  }

  public handlePointerMove(clientX: number, clientY: number, rect: RectLike): void {
    const res = normalizePointer(clientX, clientY, rect, { clamp: true });
    this.targetPointer = res.centered;
    this.targetUV = res.uv;
  }

  public handlePointerLeave(): void {
    this.targetPointer = { x: 0, y: 0 };
    this.targetUV = { u: 0.5, v: 0.5 };
  }

  public handleTouchStart(clientX: number, clientY: number, rect: RectLike): void {
    this.isTouching = true;
    this.handlePointerMove(clientX, clientY, rect);
  }

  public handleTouchMove(clientX: number, clientY: number, rect: RectLike): void {
    if (this.isTouching) {
      this.handlePointerMove(clientX, clientY, rect);
    }
  }

  public handleTouchEnd(): void {
    this.isTouching = false;
    this.handlePointerLeave();
  }

  public handleTouchCancel(): void {
    this.handleTouchEnd();
  }

  public handleScroll(scrollY: number, maxScroll: number): void {
    const scroll = normalizeScroll(scrollY, maxScroll, this.previousScrollY);
    this.scrollProgress = scroll.progress;
    this.scrollDeltaY = scroll.deltaY;
    this.previousScrollY = scrollY;
  }

  /**
   * Helper computing target displacement from normalized pointer position.
   */
  private getTargetDisplacement(): Vector2 {
    return {
      x: -this.targetPointer.x * this.options.maxDisplacementPx,
      y: -this.targetPointer.y * this.options.maxDisplacementPx,
    };
  }

  /**
   * Advances physics integration and ambient motion clock by dt seconds.
   */
  public step(dt: number): void {
    // 1. Advance ambient clock
    if (this.options.ambientMotion) {
      this.ambientTime += dt * this.options.ambientSpeed;
    }

    // 2. Integrate spring physics towards target displacement
    this.springState = stepSpring2D(
      this.springState,
      this.getTargetDisplacement(),
      dt,
      this.options.springConfig
    );
  }

  /**
   * Returns current evaluated composite shadow parameters.
   */
  public getOutput(): MotionOutput {
    // 1. Harmonic ambient motion drift
    let ambientOffsetX = 0;
    let ambientOffsetY = 0;

    if (this.options.ambientMotion) {
      const elapsedTime = this.ambientTime;
      const strength = this.options.ambientStrength;
      ambientOffsetX = (Math.sin(elapsedTime * 1.2) + Math.cos(elapsedTime * 0.7) * 0.5) * strength;
      ambientOffsetY = (Math.cos(elapsedTime * 0.9) + Math.sin(elapsedTime * 0.5) * 0.4) * (strength * 0.6);
    }

    // 2. Compute virtual light offset and direction
    const virtualLight = computeVirtualLightOffset({
      normalizedPointer: this.targetPointer,
      scrollProgress: this.scrollProgress,
      maxDisplacementPx: this.options.maxDisplacementPx,
      lightElevation: this.options.lightElevation,
      scrollInfluencePx: this.options.scrollInfluencePx,
    });

    const scrollShift = this.scrollProgress * this.options.scrollInfluencePx;
    const shadowOffsetX = this.springState.position.x + ambientOffsetX;
    const shadowOffsetY = this.springState.position.y + ambientOffsetY + scrollShift;

    // 3. Velocity-based dynamic penumbra softening (motion blur effect)
    const velocityMagnitude = Math.sqrt(
      this.springState.velocity.x ** 2 + this.springState.velocity.y ** 2
    );
    const dynamicSpread = Math.min(1.5, 1.0 + velocityMagnitude * 0.003);
    const penumbraMultiplier = virtualLight.penumbraMultiplier * dynamicSpread;

    // 4. Perspective skew (degrees) based on displacement
    const skewX = (shadowOffsetX / this.options.maxDisplacementPx) * 4;
    const skewY = (shadowOffsetY / this.options.maxDisplacementPx) * 2;

    const isAtRest =
      !this.options.ambientMotion &&
      isSpringAtRest2D(this.springState, this.getTargetDisplacement(), 0.05);

    return {
      shadowOffsetX,
      shadowOffsetY,
      x: shadowOffsetX,
      y: shadowOffsetY,
      penumbraMultiplier,
      skewX,
      skewY,
      isAtRest,
      normalizedUV: this.targetUV,
      rawPointer: this.targetPointer,
      scrollProgress: this.scrollProgress,
      scrollDeltaY: this.scrollDeltaY,
      virtualLightDirection: virtualLight.virtualLightDirection,
    };
  }
}
