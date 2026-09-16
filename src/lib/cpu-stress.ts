/**
 * Synthetic CPU stress generator to test INP and frame drop under artificial load
 */

export class CpuStressSimulator {
  private stressMs = 0;
  private intervalId: number | null = null;

  setStress(ms: number) {
    this.stressMs = Math.max(0, Math.min(100, ms));
    if (this.stressMs > 0 && this.intervalId === null) {
      this.start();
    } else if (this.stressMs === 0 && this.intervalId !== null) {
      this.stop();
    }
  }

  getStress(): number {
    return this.stressMs;
  }

  private start() {
    if (typeof window === "undefined") return;
    const burn = () => {
      if (this.stressMs > 0) {
        const start = performance.now();
        // Busy wait to simulate synchronous blocking JS (e.g. expensive layout recalculation or parsing)
        while (performance.now() - start < this.stressMs) {
          Math.sqrt(Math.random() * 1000000);
        }
      }
      this.intervalId = window.setTimeout(burn, 16);
    };
    this.intervalId = window.setTimeout(burn, 16);
  }

  private stop() {
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const globalCpuStress = new CpuStressSimulator();
