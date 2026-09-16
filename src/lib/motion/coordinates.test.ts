import { describe, it, expect } from "vitest";
import {
  normalizePointer,
  normalizeScroll,
  computeVirtualLightOffset,
} from "./coordinates";

describe("Motion Coordinate Math", () => {
  describe("normalizePointer", () => {
    it("maps element center to (0, 0) centered and (0.5, 0.5) UV", () => {
      const rect = { left: 100, top: 100, width: 400, height: 200 };
      const res = normalizePointer(300, 200, rect);
      expect(res.centered.x).toBeCloseTo(0, 5);
      expect(res.centered.y).toBeCloseTo(0, 5);
      expect(res.uv.u).toBeCloseTo(0.5, 5);
      expect(res.uv.v).toBeCloseTo(0.5, 5);
    });

    it("maps top-left corner to (-1, -1) centered and (0, 0) UV", () => {
      const rect = { left: 0, top: 0, width: 500, height: 500 };
      const res = normalizePointer(0, 0, rect);
      expect(res.centered.x).toBeCloseTo(-1, 5);
      expect(res.centered.y).toBeCloseTo(-1, 5);
      expect(res.uv.u).toBeCloseTo(0, 5);
      expect(res.uv.v).toBeCloseTo(0, 5);
    });

    it("maps bottom-right corner to (1, 1) centered and (1, 1) UV", () => {
      const rect = { left: 50, top: 50, width: 100, height: 100 };
      const res = normalizePointer(150, 150, rect);
      expect(res.centered.x).toBeCloseTo(1, 5);
      expect(res.centered.y).toBeCloseTo(1, 5);
      expect(res.uv.u).toBeCloseTo(1, 5);
      expect(res.uv.v).toBeCloseTo(1, 5);
    });

    it("clamps coordinates when clamp is enabled", () => {
      const rect = { left: 0, top: 0, width: 100, height: 100 };
      const clamped = normalizePointer(250, -50, rect, { clamp: true });
      expect(clamped.centered.x).toBe(1);
      expect(clamped.centered.y).toBe(-1);
      expect(clamped.uv.u).toBe(1);
      expect(clamped.uv.v).toBe(0);
    });

    it("safely handles zero-dimension containers without division by zero", () => {
      const rect = { left: 0, top: 0, width: 0, height: 0 };
      const res = normalizePointer(50, 50, rect);
      expect(res.centered.x).toBe(0);
      expect(res.centered.y).toBe(0);
      expect(Number.isFinite(res.centered.x)).toBe(true);
    });
  });

  describe("normalizeScroll", () => {
    it("returns 0 progress at top of page", () => {
      const res = normalizeScroll(0, 1000);
      expect(res.progress).toBe(0);
      expect(res.deltaY).toBe(0);
    });

    it("returns 1 progress at bottom of scrollable region", () => {
      const res = normalizeScroll(1000, 1000);
      expect(res.progress).toBe(1);
    });

    it("computes scroll delta correctly", () => {
      const res = normalizeScroll(350, 1000, 300);
      expect(res.deltaY).toBe(50);
    });

    it("clamps progress between 0 and 1 for overscroll bounces", () => {
      expect(normalizeScroll(-50, 1000).progress).toBe(0);
      expect(normalizeScroll(1200, 1000).progress).toBe(1);
    });

    it("safely returns 0 when total scroll distance is zero", () => {
      expect(normalizeScroll(100, 0).progress).toBe(0);
    });
  });

  describe("computeVirtualLightOffset", () => {
    it("projects opposite shadow displacement from light direction", () => {
      // Light is at top-left (-1, -1), shadow should cast towards bottom-right (+offset, +offset)
      const res = computeVirtualLightOffset({
        normalizedPointer: { x: -1, y: -1 },
        scrollProgress: 0,
        maxDisplacementPx: 40,
        lightElevation: 1.0,
      });

      expect(res.shadowOffsetX).toBeGreaterThan(0);
      expect(res.shadowOffsetY).toBeGreaterThan(0);
      expect(res.penumbraMultiplier).toBeGreaterThan(0);
      expect(res.virtualLightDirection.z).toBeGreaterThan(0);
    });

    it("increases penumbra spread as light distance or elevation changes", () => {
      const highLight = computeVirtualLightOffset({
        normalizedPointer: { x: 0, y: 0 },
        scrollProgress: 0,
        maxDisplacementPx: 40,
        lightElevation: 2.0,
      });

      const lowLight = computeVirtualLightOffset({
        normalizedPointer: { x: 0, y: 0 },
        scrollProgress: 0,
        maxDisplacementPx: 40,
        lightElevation: 0.5,
      });

      expect(highLight.penumbraMultiplier).toBeGreaterThan(lowLight.penumbraMultiplier);
    });

    it("shifts vertical light offset based on scroll progress", () => {
      const topOffset = computeVirtualLightOffset({
        normalizedPointer: { x: 0, y: 0 },
        scrollProgress: 0,
        maxDisplacementPx: 40,
        scrollInfluencePx: 30,
      });

      const scrolledOffset = computeVirtualLightOffset({
        normalizedPointer: { x: 0, y: 0 },
        scrollProgress: 1,
        maxDisplacementPx: 40,
        scrollInfluencePx: 30,
      });

      expect(scrolledOffset.shadowOffsetY).not.toBe(topOffset.shadowOffsetY);
    });
  });
});
