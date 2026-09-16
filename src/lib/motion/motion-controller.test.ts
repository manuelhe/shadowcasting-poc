import { describe, it, expect } from "vitest";
import { MotionController } from "./motion-controller";
import { SPRING_PRESETS } from "./spring";

describe("MotionController", () => {
  it("initializes with centered neutral coordinates and zero velocity", () => {
    const controller = new MotionController({
      springConfig: SPRING_PRESETS.smooth,
      ambientMotion: false,
    });

    const output = controller.getOutput();
    expect(output.shadowOffsetX).toBe(0);
    expect(output.shadowOffsetY).toBe(0);
    expect(output.isAtRest).toBe(true);
  });

  it("smoothly steers shadow offset towards pointer input over successive steps", () => {
    const controller = new MotionController({
      springConfig: SPRING_PRESETS.snappy,
      maxDisplacementPx: 50,
      ambientMotion: false,
    });

    // Pointer moves to bottom-right (1, 1), shadow should cast towards top-left (-50, -50)
    controller.handlePointerMove(200, 200, {
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    });

    // Step physics
    controller.step(0.016);
    const out1 = controller.getOutput();
    expect(out1.shadowOffsetX).toBeLessThan(0);
    expect(out1.shadowOffsetY).toBeLessThan(0);
    expect(out1.isAtRest).toBe(false);

    // After 60 frames, should converge near target (-50, -50)
    for (let i = 0; i < 60; i++) {
      controller.step(0.016);
    }
    const outConverged = controller.getOutput();
    expect(outConverged.shadowOffsetX).toBeCloseTo(-50, 0);
    expect(outConverged.shadowOffsetY).toBeCloseTo(-50, 0);
    expect(outConverged.isAtRest).toBe(true);
  });

  it("handles touch drag and releases back to neutral position on touch end", () => {
    const controller = new MotionController({
      springConfig: SPRING_PRESETS.smooth,
      maxDisplacementPx: 40,
      ambientMotion: false,
    });

    // Touch down at center, move to left
    controller.handleTouchStart(100, 100, { left: 0, top: 0, width: 200, height: 200 });
    controller.handleTouchMove(0, 100, { left: 0, top: 0, width: 200, height: 200 });

    for (let i = 0; i < 30; i++) controller.step(0.016);

    // Pointer was at left (-1, 0), so shadow projects to right (+x)
    expect(controller.getOutput().shadowOffsetX).toBeGreaterThan(20);

    // Touch end releases to neutral (0, 0)
    controller.handleTouchEnd();
    for (let i = 0; i < 60; i++) controller.step(0.016);

    expect(Math.abs(controller.getOutput().shadowOffsetX)).toBeLessThan(1.0);
  });

  it("modulates shadow Y displacement with scroll progress", () => {
    const controller = new MotionController({
      scrollInfluencePx: 30,
      ambientMotion: false,
    });

    controller.handleScroll(0, 1000);
    controller.step(0.016);
    const topY = controller.getOutput().shadowOffsetY;

    controller.handleScroll(1000, 1000);
    controller.step(0.016);
    const scrolledY = controller.getOutput().shadowOffsetY;

    expect(scrolledY).toBeGreaterThan(topY);
  });

  it("blends ambient wind sway into total offset when ambient motion is enabled", () => {
    const controller = new MotionController({
      ambientMotion: true,
      ambientWindStrength: 10,
    });

    controller.step(0.5); // Advance ambient clock
    const out = controller.getOutput();
    // Ambient offset should be active even with pointer at rest
    expect(out.shadowOffsetX !== 0 || out.shadowOffsetY !== 0).toBe(true);
  });
});
