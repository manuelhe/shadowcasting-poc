import { describe, it, expect } from "vitest";
import {
  normalizePointer,
  normalizeScroll,
  computeVirtualLightOffset,
} from "./coordinates";

describe("Motion Coordinate Math", () => {
  describe("normalizePointer", () => {
    it("maps element center to (0, 0)", () => {
      const rect = { left: 100, top: 100, width: 400, height: 200 };
      const normalized = normalizePointer(300, 200, rect);
      expect(normalized.x).toBeCloseTo(0, 5);
      expect(normalized.y).toBeCloseTo(0, 5);
    });

    it("maps top-left corner to (-1, -1)", () => {
      const rect = { left: 0, top: 0, width: 500, height: 500 };
      const normalized = normalizePointer(0, 0, rect);
      expect(normalized.x).toBeCloseTo(-1, 5);
      expect(normalized.y).toBeCloseTo(-1, 5);
    });

    it("maps bottom-right corner to (1, 1)", () => {
      const rect = { left: 50, top: 50, width: 100, height: 100 };
      const normalized = normalizePointer(150, 150, rect);
      expect(normalized.x).toBeCloseTo(1, 5);
      expect(normalized.y).toBeCloseTo(1, 5);
    });

    it("clamps coordinates when clamp is enabled", () => {
      const rect = { left: 0, top: 0, width: 100, height: 100 };
      const clamped = normalizePointer(250, -50, rect, { clamp: true });
      expect(clamped.x).toBe(1);
      expect(clamped.y).toBe(-1);
    });

    it("safely handles zero-dimension containers without division by zero", () => {
      const rect = { left: 0, top: 0, width: 0, height: 0 };
      const normalized = normalizePointer(50, 50, rect);
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
      expect(Number.isFinite(normalized.x)).toBe(true);
    });
  });

  describe("normalizeScroll", () => {
    it("returns 0 progress at top of page", () => {
      const progress = normalizeScroll(0, 1000);
      expect(progress).toBe(0);
    });

    it("returns 1 progress at bottom of scrollable region", () => {
      const progress = normalizeScroll(1000, 1000);
      expect(progress).toBe(1);
    });

    it("clamps progress between 0 and 1 for overscroll bounces", () => {
      expect(normalizeScroll(-50, 1000)).toBe(0);
      expect(normalizeScroll(1200, 1000)).toBe(1);
    });

    it("safely returns 0 when total scroll distance is zero", () => {
      expect(normalizeScroll(100, 0)).toBe(0);
    });
  });

  describe("computeVirtualLightOffset", () => {
    it("projects opposite shadow displacement from light direction", () => {
      // Light is at top-left (-1, -1), shadow should cast towards bottom-right (+offset, +offset)
      const offset = computeVirtualLightOffset({
        normalizedPointer: { x: -1, y: -1 },
        scrollProgress: 0,
        maxDisplacementPx: 40,
        lightElevation: 1.0,
      });

      expect(offset.shadowX).toBeGreaterThan(0);
      expect(offset.shadowY).toBeGreaterThan(0);
      expect(offset.penumbraMultiplier).toBeGreaterThan(0);
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
        scrollInfluence: 30,
      });

      const scrolledOffset = computeVirtualLightOffset({
        normalizedPointer: { x: 0, y: 0 },
        scrollProgress: 1,
        maxDisplacementPx: 40,
        scrollInfluence: 30,
      });

      expect(scrolledOffset.shadowY).not.toBe(topOffset.shadowY);
    });
  });
});
