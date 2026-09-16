import { describe, it, expect } from "vitest";
import {
  stepSpring1D,
  stepSpring2D,
  isSpringAtRest2D,
  SPRING_PRESETS,
  SpringState2D,
} from "./spring";

describe("Spring Damping & Inertia Physics Solver", () => {
  describe("stepSpring1D", () => {
    it("moves state towards target position", () => {
      const state = { position: 0, velocity: 0 };
      const next = stepSpring1D(state, 10, 0.016, SPRING_PRESETS.smooth);

      expect(next.position).toBeGreaterThan(0);
      expect(next.position).toBeLessThan(10);
      expect(next.velocity).toBeGreaterThan(0);
    });

    it("converges to target over time without divergence", () => {
      let state = { position: 0, velocity: 0 };
      const target = 50;

      // Simulate 60 frames (1 second at 60fps)
      for (let i = 0; i < 60; i++) {
        state = stepSpring1D(state, target, 0.016, SPRING_PRESETS.snappy);
      }

      expect(Math.abs(state.position - target)).toBeLessThan(0.1);
      expect(Math.abs(state.velocity)).toBeLessThan(1.0);
    });

    it("clamps large dt (e.g. tab backgrounded) to prevent numerical instability", () => {
      const state = { position: 0, velocity: 0 };
      // 5 seconds frame drop
      const next = stepSpring1D(state, 100, 5.0, SPRING_PRESETS.bouncy);

      expect(Number.isFinite(next.position)).toBe(true);
      expect(Number.isFinite(next.velocity)).toBe(true);
      expect(next.position).toBeLessThan(200); // No infinite explosion
    });
  });

  describe("stepSpring2D", () => {
    it("simultaneously integrates x and y components", () => {
      const state: SpringState2D = {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      const target = { x: 20, y: -40 };

      const next = stepSpring2D(state, target, 0.016, SPRING_PRESETS.smooth);

      expect(next.position.x).toBeGreaterThan(0);
      expect(next.position.y).toBeLessThan(0);
      expect(next.velocity.x).toBeGreaterThan(0);
      expect(next.velocity.y).toBeLessThan(0);
    });
  });

  describe("isSpringAtRest2D", () => {
    it("returns true when position is within tolerance and velocity is near zero", () => {
      const state: SpringState2D = {
        position: { x: 10.001, y: 19.999 },
        velocity: { x: 0.002, y: -0.001 },
      };
      const target = { x: 10, y: 20 };

      expect(isSpringAtRest2D(state, target, 0.01)).toBe(true);
    });

    it("returns false while velocity is still active", () => {
      const state: SpringState2D = {
        position: { x: 10, y: 20 },
        velocity: { x: 5.0, y: 0 },
      };
      const target = { x: 10, y: 20 };

      expect(isSpringAtRest2D(state, target, 0.01)).toBe(false);
    });

    it("returns false while position is far from target", () => {
      const state: SpringState2D = {
        position: { x: 5, y: 20 },
        velocity: { x: 0, y: 0 },
      };
      const target = { x: 10, y: 20 };

      expect(isSpringAtRest2D(state, target, 0.01)).toBe(false);
    });
  });

  describe("Spring Presets", () => {
    it("exhibits higher inertia with inertial preset than snappy preset", () => {
      let snappyState: SpringState2D = {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      let inertialState: SpringState2D = {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
      };
      const target = { x: 100, y: 0 };

      // After 5 frames, snappy should have moved faster towards target
      for (let i = 0; i < 5; i++) {
        snappyState = stepSpring2D(snappyState, target, 0.016, SPRING_PRESETS.snappy);
        inertialState = stepSpring2D(inertialState, target, 0.016, SPRING_PRESETS.inertial);
      }

      expect(snappyState.position.x).toBeGreaterThan(inertialState.position.x);
    });
  });
});
