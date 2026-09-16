/**
 * Real-time Core Web Vitals (LCP, INP, CLS, FCP, TTFB) monitor with attribution
 */

export interface MetricRating {
  value: number;
  formatted: string;
  rating: "good" | "needs-improvement" | "poor";
  target: string;
  attribution?: string;
}

export interface VitalsSnapshot {
  lcp: MetricRating | null;
  inp: MetricRating | null;
  cls: MetricRating | null;
  fcp: MetricRating | null;
  ttfb: MetricRating | null;
}

export type VitalsCallback = (vitals: VitalsSnapshot) => void;

class VitalsTracker {
  private initialized = false;
  private snapshot: VitalsSnapshot = {
    lcp: null,
    inp: null,
    cls: null,
    fcp: null,
    ttfb: null,
  };
  private subscribers = new Set<VitalsCallback>();

  init() {
    if (typeof window === "undefined" || this.initialized) return;
    this.initialized = true;

    // Dynamically import web-vitals/attribution to avoid SSR issues and get attribution data
    import("web-vitals/attribution").then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
      onLCP((metric) => {
        this.snapshot.lcp = {
          value: metric.value,
          formatted: `${Math.round(metric.value)}ms`,
          rating: metric.rating,
          target: "≤ 2.5s",
          attribution: (metric.attribution as { element?: string })?.element || undefined,
        };
        this.notify();
      }, { reportAllChanges: true });

      onINP((metric) => {
        this.snapshot.inp = {
          value: metric.value,
          formatted: `${Math.round(metric.value)}ms`,
          rating: metric.rating,
          target: "≤ 200ms",
          attribution: (metric.attribution as { interactionTarget?: string })?.interactionTarget || undefined,
        };
        this.notify();
      }, { reportAllChanges: true });

      onCLS((metric) => {
        this.snapshot.cls = {
          value: metric.value,
          formatted: metric.value.toFixed(4),
          rating: metric.rating,
          target: "≤ 0.1",
        };
        this.notify();
      }, { reportAllChanges: true });

      onFCP((metric) => {
        this.snapshot.fcp = {
          value: metric.value,
          formatted: `${Math.round(metric.value)}ms`,
          rating: metric.rating,
          target: "≤ 1.8s",
        };
        this.notify();
      });

      onTTFB((metric) => {
        this.snapshot.ttfb = {
          value: metric.value,
          formatted: `${Math.round(metric.value)}ms`,
          rating: metric.rating,
          target: "≤ 800ms",
        };
        this.notify();
      });
    }).catch(console.error);
  }

  private notify() {
    const copy = { ...this.snapshot };
    this.subscribers.forEach((cb) => cb(copy));
  }

  subscribe(cb: VitalsCallback): () => void {
    this.subscribers.add(cb);
    cb({ ...this.snapshot });
    if (!this.initialized) {
      this.init();
    }
    return () => {
      this.subscribers.delete(cb);
    };
  }

  getSnapshot(): VitalsSnapshot {
    return { ...this.snapshot };
  }

  reset() {
    this.snapshot = {
      lcp: null,
      inp: null,
      cls: null,
      fcp: null,
      ttfb: null,
    };
    this.notify();
  }
}

export const globalVitalsTracker = new VitalsTracker();
