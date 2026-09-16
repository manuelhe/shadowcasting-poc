/**
 * High-precision FPS & frame render time tracker
 */

export interface FrameMetrics {
  fps: number;
  frameTimeMs: number;
  minFrameTimeMs: number;
  maxFrameTimeMs: number;
  droppedFramesCount: number;
  history: number[]; // Last 60 frame times
}

export type FrameCallback = (metrics: FrameMetrics) => void;

export class FpsTracker {
  private rafId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  private currentFps = 60;
  private frameTimes: number[] = [];
  private minTime = Infinity;
  private maxTime = 0;
  private droppedFrames = 0;
  private subscribers = new Set<FrameCallback>();

  start() {
    if (typeof window === "undefined" || this.rafId !== null) return;

    this.lastTime = performance.now();
    this.lastFpsUpdateTime = this.lastTime;
    this.frameTimes = [];
    this.minTime = Infinity;
    this.maxTime = 0;
    this.droppedFrames = 0;

    const loop = (now: number) => {
      const delta = now - this.lastTime;
      this.lastTime = now;

      if (delta > 0 && delta < 1000) {
        this.frameTimes.push(delta);
        if (this.frameTimes.length > 60) this.frameTimes.shift();

        if (delta < this.minTime) this.minTime = delta;
        if (delta > this.maxTime) this.maxTime = delta;

        // Any frame exceeding 24ms (~41fps threshold) is flagged as dropped on standard 60Hz displays
        if (delta > 24) {
          this.droppedFrames++;
        }
      }

      this.frameCount++;

      // Update reported FPS every 500ms
      if (now - this.lastFpsUpdateTime >= 500) {
        const elapsed = (now - this.lastFpsUpdateTime) / 1000;
        this.currentFps = Math.round(this.frameCount / elapsed);
        this.frameCount = 0;
        this.lastFpsUpdateTime = now;

        const currentFrameTime =
          this.frameTimes.length > 0
            ? this.frameTimes[this.frameTimes.length - 1]
            : 16.67;

        const metrics: FrameMetrics = {
          fps: this.currentFps,
          frameTimeMs: Math.round(currentFrameTime * 10) / 10,
          minFrameTimeMs: Math.round((this.minTime === Infinity ? 16.67 : this.minTime) * 10) / 10,
          maxFrameTimeMs: Math.round(this.maxTime * 10) / 10,
          droppedFramesCount: this.droppedFrames,
          history: [...this.frameTimes],
        };

        this.subscribers.forEach((cb) => cb(metrics));
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  subscribe(cb: FrameCallback): () => void {
    this.subscribers.add(cb);
    if (this.rafId === null) {
      this.start();
    }
    return () => {
      this.subscribers.delete(cb);
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  reset() {
    this.minTime = Infinity;
    this.maxTime = 0;
    this.droppedFrames = 0;
    this.frameTimes = [];
  }
}

export const globalFpsTracker = new FpsTracker();
