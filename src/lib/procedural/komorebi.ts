/**
 * Komorebi Simplex Canopy Noise Generator
 * Simulates sunlight filtering through swaying organic foliage canopy ("komorebi").
 * Implements 2D Simplex Noise with fractional Brownian motion (fBm) and domain warping.
 */

export interface KomorebiOptions {
  scale?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  contrast?: number;
  speed?: number;
  windDriftX?: number;
  windDriftY?: number;
}

const DEFAULT_OPTIONS: Required<KomorebiOptions> = {
  scale: 4.5,
  octaves: 3,
  persistence: 0.5,
  lacunarity: 2.1,
  contrast: 1.5,
  speed: 0.4,
  windDriftX: 0.05,
  windDriftY: 0.03,
};

// 2D Simplex Noise implementation (based on Gustavson)
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

// Permutation table for gradient hashing
const P = new Uint8Array(512);
const PERM = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36,
  103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75,
  0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149,
  56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
  77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46,
  245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187,
  208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173,
  186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85,
  212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119,
  248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39,
  253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
  251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
  14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
  50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141,
  128, 195, 78, 66, 215, 61, 156, 180,
];

for (let i = 0; i < 256; i++) {
  P[i] = PERM[i];
  P[256 + i] = PERM[i];
}

const GRAD2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [1, 0], [-1, 0],
  [0, 1], [0, -1], [0, 1], [0, -1],
];

function simplex2D(xin: number, yin: number): number {
  let n0 = 0;
  let n1 = 0;
  let n2 = 0;

  // Skew input space
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  // Determine simplex corner offsets
  let i1: number;
  let j1: number;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  // Hashed gradient indices
  const ii = i & 255;
  const jj = j & 255;
  const gi0 = P[ii + P[jj]] % 12;
  const gi1 = P[ii + i1 + P[jj + j1]] % 12;
  const gi2 = P[ii + 1 + P[jj + 1]] % 12;

  // Contributions from corners
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) {
    t0 *= t0;
    n0 = t0 * t0 * (GRAD2[gi0][0] * x0 + GRAD2[gi0][1] * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) {
    t1 *= t1;
    n1 = t1 * t1 * (GRAD2[gi1][0] * x1 + GRAD2[gi1][1] * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) {
    t2 *= t2;
    n2 = t2 * t2 * (GRAD2[gi2][0] * x2 + GRAD2[gi2][1] * y2);
  }

  // Returns in range approx [-1, 1]
  return 70.0 * (n0 + n1 + n2);
}

/**
 * Samples fractional Brownian motion (fBm) with temporal drift
 */
function fbm2D(
  x: number,
  y: number,
  time: number,
  octaves: number,
  persistence: number,
  lacunarity: number
): number {
  let value = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxAmp = 0;

  for (let i = 0; i < octaves; i++) {
    // Add subtle temporal oscillation per octave
    const phaseX = Math.sin(time * 0.5 * (i + 1)) * 0.15;
    const phaseY = Math.cos(time * 0.4 * (i + 1)) * 0.15;

    value += simplex2D(x * frequency + phaseX, y * frequency + phaseY) * amplitude;
    maxAmp += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value / maxAmp;
}

/**
 * Samples the komorebi shadow density at UV coordinates (0..1)
 * Returns a value in [0, 1] where:
 * 0.0 = bright dappled sunlight hole
 * 1.0 = full dark foliage shade
 */
export function sampleKomorebi(
  u: number,
  v: number,
  time: number,
  options?: KomorebiOptions
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const t = time * opts.speed;

  // Domain warping: distortion vector creates organic swirling foliage movement
  const warpX = opts.windDriftX * t + simplex2D(u * 1.5, v * 1.5 + t * 0.2) * 0.1;
  const warpY = opts.windDriftY * t + simplex2D(u * 1.5 + 4.2, v * 1.5 - t * 0.2) * 0.1;

  const nx = (u + warpX) * opts.scale;
  const ny = (v + warpY) * opts.scale;

  // Sample multi-octave canopy noise
  const rawNoise = fbm2D(
    nx,
    ny,
    t,
    opts.octaves,
    opts.persistence,
    opts.lacunarity
  );

  // Normalize [-1, 1] to [0, 1]
  let val = (rawNoise + 1.0) * 0.5;

  // Contrast / Aperture enhancement: create sharp dappled sunlight spots
  // Contrast curve centered at 0.45 (canopy aperture threshold)
  val = Math.pow(Math.max(0, Math.min(1, val)), opts.contrast);

  return Math.max(0, Math.min(1, val));
}

/**
 * Pre-computes a Float32Array density grid of size width x height at given time
 */
export function createKomorebiField(
  width: number,
  height: number,
  time: number,
  options?: KomorebiOptions
): Float32Array {
  const buffer = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const v = y / (height - 1 || 1);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1 || 1);
      buffer[y * width + x] = sampleKomorebi(u, v, time, options);
    }
  }
  return buffer;
}
