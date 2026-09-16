import { describe, it, expect } from "vitest";
import { sampleKomorebi, createKomorebiField, KomorebiOptions } from "./komorebi";

describe("Komorebi Simplex Canopy Noise Generator", () => {
  it("returns shadow density strictly bounded between 0.0 and 1.0", () => {
    const samples = [
      sampleKomorebi(0, 0, 0),
      sampleKomorebi(0.5, 0.5, 1.2),
      sampleKomorebi(0.99, 0.99, 4.5),
      sampleKomorebi(0.12, 0.88, 10.0),
    ];

    for (const val of samples) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("produces deterministic output for identical coordinates and time", () => {
    const val1 = sampleKomorebi(0.35, 0.72, 2.5);
    const val2 = sampleKomorebi(0.35, 0.72, 2.5);
    expect(val1).toBeCloseTo(val2, 6);
  });

  it("exhibits spatial continuity without discontinuous jumps", () => {
    const u = 0.5;
    const v = 0.5;
    const time = 1.0;
    const val1 = sampleKomorebi(u, v, time);
    const val2 = sampleKomorebi(u + 0.001, v + 0.001, time);

    // Delta should be tiny for a 0.001 change
    expect(Math.abs(val1 - val2)).toBeLessThan(0.05);
  });

  it("generates continuous temporal animation", () => {
    const u = 0.4;
    const v = 0.6;
    const valAtT0 = sampleKomorebi(u, v, 0.0);
    const valAtT1 = sampleKomorebi(u, v, 0.05);
    const valAtT10 = sampleKomorebi(u, v, 10.0);

    // Close in time -> close in value
    expect(Math.abs(valAtT0 - valAtT1)).toBeLessThan(0.1);
    // Far in time -> may vary
    expect(typeof valAtT10).toBe("number");
  });

  it("respects custom scale and contrast options", () => {
    const options: KomorebiOptions = {
      scale: 8.0,
      octaves: 3,
      contrast: 1.8,
      speed: 0.5,
    };
    const val = sampleKomorebi(0.5, 0.5, 1.0, options);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it("createKomorebiField generates an offscreen density buffer for canvas/webgl streaming", () => {
    const width = 32;
    const height = 32;
    const buffer = createKomorebiField(width, height, 1.0);

    expect(buffer).toBeInstanceOf(Float32Array);
    expect(buffer.length).toBe(width * height);
    for (let i = 0; i < buffer.length; i++) {
      expect(buffer[i]).toBeGreaterThanOrEqual(0);
      expect(buffer[i]).toBeLessThanOrEqual(1);
    }
  });
});
