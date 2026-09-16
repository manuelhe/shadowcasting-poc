/**
 * Headless Motion Controller
 * Unifies pointer parallax, scroll elevation tilt, touch interactions,
 * and ambient wind sway through a second-order spring physics solver.
 */

import {
  RectLike,
  Vector2,
  normalizePointer,
  normalizeScroll,
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
  ambientWindSpeed?: number;
  ambientWindStrength?: number;
}

export interface MotionOutput {
  shadowOffsetX: number;
  shadowOffsetY: number;
  penumbraMultiplier: number;
  skewX: number;
  skewY: number;
  isAtRest: boolean;
  rawPointer: Vector2;
  scrollProgress: number;
}

export class MotionController {
  private options: Required<MotionControllerOptions>;
  private springState: SpringState2D;
  private targetPointer: Vector2;
  private scrollProgress: number;
  private ambientTime: number;
  private isPointerInside: boolean;
  private isTouching: boolean;

  constructor(options?: MotionControllerOptions) {
    this.options = {
      springConfig: options?.springConfig ?? SPRING_PRESETS.smooth,
      maxDisplacementPx: options?.maxDisplacementPx ?? 45,
      lightElevation: options?.lightElevation ?? 1.0,
      scrollInfluencePx: options?.scrollInfluencePx ?? 25,
      ambientMotion: options?.ambientMotion ?? true,
      ambientWindSpeed: options?.ambientWindSpeed ?? 0.8,
      ambientWindStrength: options?.ambientWindStrength ?? 8,
    };

    this.springState = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    };

    this.targetPointer = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.ambientTime = 0;
    this.isPointerInside = false;
    this.isTouching = false;
  }

  public setSpringConfig(config: SpringConfig): void {
    this.options.springConfig = config;
  }

  public setAmbientMotion(enabled: boolean): void {
    this.options.ambientMotion = enabled;
  }

  public handlePointerMove(clientX: number, clientY: number, rect: RectLike): void {
    const norm = normalizePointer(clientX, clientY, rect, { clamp: true });
    this.targetPointer = norm;
    this.isPointerInside = true;
  }

  public handlePointerLeave(): void {
    this.targetPointer = { x: 0, y: 0 };
    this.isPointerInside = false;
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

  public handleScroll(scrollY: number, maxScroll: number): void {
    this.scrollProgress = normalizeScroll(scrollY, maxScroll);
  }

  /**
   * Advances physics integration and ambient motion clock by dt seconds.
   */
  public step(dt: number): void {
    // 1. Advance ambient clock
    if (this.options.ambientMotion) {
      this.ambientTime += dt * this.options.ambientWindSpeed;
    }

    // 2. Target displacement: light at (tx, ty) casts shadow in opposite direction (-tx, -ty)
    const targetDisplacement: Vector2 = {
      x: -this.targetPointer.x * this.options.maxDisplacementPx,
      y: -this.targetPointer.y * this.options.maxDisplacementPx,
    };

    // 3. Integrate spring physics
    this.springState = stepSpring2D(
      this.springState,
      targetDisplacement,
      dt,
      this.options.springConfig
    );
  }

  /**
   * Returns current evaluated composite shadow parameters.
   */
  public getOutput(): MotionOutput {
    // Ambient wind sway: harmonic Lissajous drift
    let ambientX = 0;
    let ambientY = 0;

    if (this.options.ambientMotion) {
      const t = this.ambientTime;
      const str = this.options.ambientWindStrength;
      ambientX = (Math.sin(t * 1.2) + Math.cos(t * 0.7) * 0.5) * str;
      ambientY = (Math.cos(t * 0.9) + Math.sin(t * 0.5) * 0.4) * (str * 0.6);
    }

    // Scroll progress shifts light elevation vertically downwards
    const scrollOffset = this.scrollProgress * this.options.scrollInfluencePx;

    const shadowOffsetX = this.springState.position.x + ambientX;
    const shadowOffsetY = this.springState.position.y + ambientY + scrollOffset;

    // Velocity-based dynamic penumbra softening (motion blur effect)
    const velMagnitude = Math.sqrt(
      this.springState.velocity.x ** 2 + this.springState.velocity.y ** 2
    );
    const dynamicSpread = Math.min(1.5, 1.0 + velMagnitude * 0.003);
    const penumbraMultiplier = this.options.lightElevation * dynamicSpread;

    // Perspective skew (degrees) based on displacement
    const skewX = (shadowOffsetX / this.options.maxDisplacementPx) * 4;
    const skewY = (shadowOffsetY / this.options.maxDisplacementPx) * 2;

    const targetDisplacement = {
      x: -this.targetPointer.x * this.options.maxDisplacementPx,
      y: -this.targetPointer.y * this.options.maxDisplacementPx,
    };

    const isAtRest =
      !this.options.ambientMotion &&
      isSpringAtRest2D(this.springState, targetDisplacement, 0.05);

    return {
      shadowOffsetX,
      shadowOffsetY,
      penumbraMultiplier,
      skewX,
      skewY,
      isAtRest,
      rawPointer: this.targetPointer,
      scrollProgress: this.scrollProgress,
    };
  }
}
