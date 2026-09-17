/**
 * Second-order Spring Damping & Inertia Physics Solver
 */

import { Vector2 } from "./coordinates";

export interface SpringConfig {
  stiffness: number; // Spring constant (k), e.g. 170
  damping: number;   // Friction / dissipation (c), e.g. 20
  mass: number;      // Inertia / weight (m), e.g. 1.0
}

export interface SpringState1D {
  position: number;
  velocity: number;
}

export interface SpringState2D {
  position: Vector2;
  velocity: Vector2;
}

export const SPRING_PRESETS: Record<"snappy" | "smooth" | "inertial" | "bouncy" | "energetic", SpringConfig> = {
  snappy: {
    stiffness: 280,
    damping: 30,
    mass: 1.0,
  },
  smooth: {
    stiffness: 160,
    damping: 20,
    mass: 1.0,
  },
  inertial: {
    stiffness: 70,
    damping: 14,
    mass: 2.2,
  },
  bouncy: {
    stiffness: 180,
    damping: 11,
    mass: 1.0,
  },
  energetic: {
    stiffness: 240,
    damping: 18,
    mass: 0.9,
  },
};

/**
 * Step a 1D spring using semi-implicit Euler integration.
 * Clamps large dt to prevent numerical explosion.
 */
export function stepSpring1D(
  state: SpringState1D,
  target: number,
  dt: number,
  config: SpringConfig
): SpringState1D {
  // Clamp delta time to maximum of 64ms (approx 4 frames at 60fps) to maintain stability
  const safeDt = Math.min(dt, 0.064);

  // Substep integration for high stiffness stability
  const steps = safeDt > 0.032 ? 2 : 1;
  const subDt = safeDt / steps;

  let pos = state.position;
  let vel = state.velocity;

  const { stiffness, damping, mass } = config;
  const invMass = 1.0 / Math.max(0.01, mass);

  for (let i = 0; i < steps; i++) {
    const displacement = pos - target;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * vel;
    const totalForce = springForce + dampingForce;

    const acceleration = totalForce * invMass;
    vel += acceleration * subDt;
    pos += vel * subDt;
  }

  return {
    position: pos,
    velocity: vel,
  };
}

/**
 * Step a 2D spring state towards a target Vector2 position.
 */
export function stepSpring2D(
  state: SpringState2D,
  target: Vector2,
  dt: number,
  config: SpringConfig
): SpringState2D {
  const nextX = stepSpring1D(
    { position: state.position.x, velocity: state.velocity.x },
    target.x,
    dt,
    config
  );

  const nextY = stepSpring1D(
    { position: state.position.y, velocity: state.velocity.y },
    target.y,
    dt,
    config
  );

  return {
    position: { x: nextX.position, y: nextY.position },
    velocity: { x: nextX.velocity, y: nextY.velocity },
  };
}

/**
 * Checks whether a 2D spring has settled sufficiently close to target.
 * Useful for powering down rAF animation loops when idle to conserve battery.
 */
export function isSpringAtRest2D(
  state: SpringState2D,
  target: Vector2,
  tolerance = 0.02
): boolean {
  const dx = Math.abs(state.position.x - target.x);
  const dy = Math.abs(state.position.y - target.y);
  const vx = Math.abs(state.velocity.x);
  const vy = Math.abs(state.velocity.y);

  return dx < tolerance && dy < tolerance && vx < tolerance * 2 && vy < tolerance * 2;
}
