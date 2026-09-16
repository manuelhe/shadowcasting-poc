import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";

// Provide resolution mappings for Next.js path aliases without requiring a custom vitest.config
vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("../lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("../lib/procedural/branch-skeleton");
});
vi.mock("@/lib/motion/motion-controller", async () => {
  return await vi.importActual("../lib/motion/motion-controller");
});
vi.mock("@/lib/motion/spring", async () => {
  return await vi.importActual("../lib/motion/spring");
});
vi.mock("@/hooks/useMotionController", async () => {
  return await vi.importActual("../hooks/useMotionController");
});

import {
  ShadowBackground,
  evaluateHardwareGating,
  isWebGLSupported,
  resolveShadowEngine,
  resolveScrollInfluence,
  EngineErrorBoundary,
  ShadowCasterConfig,
  type MotionPreset,
  type MotionConfig,
} from "./ShadowBackground";
import { SPRING_PRESETS } from "../lib/motion/spring";
import { MotionController, MotionOutput } from "../lib/motion/motion-controller";
import { WebGlShadowEngine, type WebGlShadowEngineProps } from "./engines/WebGlShadowEngine";
import { Canvas2dShadowEngine } from "./engines/Canvas2dShadowEngine";
import { type ShadowEngineProps } from "./engines/CssShadowEngine";
import { ProceduralKomorebiEngine, type ProceduralKomorebiProps } from "./engines/ProceduralKomorebiEngine";
import { ProceduralBranchEngine, type ProceduralBranchProps } from "./engines/ProceduralBranchEngine";

describe("<ShadowBackground />", () => {
  describe("1. Zero-LCP SSR Static Poster & Initial Render", () => {
    it("renders the static poster image with priority, fill, and default object-cover", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base-minimal-studio.svg"
          caster={{ type: "image", src: "/images/caster-branch.svg" }}
        />
      );

      // Verify wrapper styles for layout stability (0.000 CLS)
      expect(html).toContain("relative w-full h-full overflow-hidden");

      // Verify background container layer
      expect(html).toContain("absolute inset-0 pointer-events-none z-0");

      // Verify Next.js image attributes for SSR zero-LCP preload
      expect(html).toContain("data-nimg=\"fill\"");
      expect(html).toContain("object-cover");
      expect(html).toContain("/images/base-minimal-studio.svg");
      // Priority in Next.js SSR creates a preload link tag
      expect(html).toContain("rel=\"preload\"");
      expect(html).toContain("as=\"image\"");

      // Verify no dynamic canvas is rendered during SSR
      expect(html).not.toContain("<canvas");
    });

    it("uses poster prop when provided instead of basePlate for the static poster", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base-minimal-studio.svg"
          poster="/images/poster-hero-composite.webp"
          caster={{ type: "image", src: "/images/caster-branch.svg" }}
        />
      );

      expect(html).toContain("poster-hero-composite.webp");
    });

    it("respects the fit prop ('contain', 'fill', 'cover')", () => {
      const htmlContain = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
          fit="contain"
        />
      );
      expect(htmlContain).toContain("object-contain");
      expect(htmlContain).toContain("data-fit=\"contain\"");

      const htmlFill = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
          fit="fill"
        />
      );
      expect(htmlFill).toContain("object-fill");
      expect(htmlFill).toContain("data-fit=\"fill\"");
    });

    it("applies custom className to the outer wrapper", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
          className="custom-hero-banner"
        />
      );

      expect(html).toContain("relative w-full h-full overflow-hidden custom-hero-banner");
    });

    it("forwards standard HTML attributes (id, role, data-testid, aria-label) to the container", () => {
      const html = renderToString(
        <ShadowBackground
          id="hero-bg"
          role="region"
          aria-label="Dynamic ambient shadow background"
          data-testid="shadow-container"
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
        />
      );

      expect(html).toContain('id="hero-bg"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Dynamic ambient shadow background"');
      expect(html).toContain('data-testid="shadow-container"');
    });

    it("supports blendMode ('multiply' and 'normal') and reflects on container data-blend-mode", () => {
      const htmlDefault = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
        />
      );
      expect(htmlDefault).toContain('data-blend-mode="multiply"');

      const htmlNormal = renderToString(
        <ShadowBackground
          blendMode="normal"
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
        />
      );
      expect(htmlNormal).toContain('data-blend-mode="normal"');
    });
  });

  describe("2. Stacking Context & Foreground Children", () => {
    it("renders children in foreground layer with relative z-10 above z-0 background", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
        >
          <div data-testid="hero-content">
            <h1>Interactive Hero Title</h1>
            <button type="button">Get Started</button>
          </div>
        </ShadowBackground>
      );

      // Background layer has z-0 and pointer-events-none
      expect(html).toContain("absolute inset-0 pointer-events-none z-0");

      // Foreground layer has relative z-10 w-full h-full
      expect(html).toContain("relative z-10 w-full h-full");
      expect(html).toContain("Interactive Hero Title");
      expect(html).toContain("Get Started");
    });

    it("does not render foreground layer if children are not provided", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
        />
      );

      expect(html).not.toContain("relative z-10 w-full h-full");
    });
  });

  describe("3. Hardware Capability Gating & force-static degradation", () => {
    const originalNavigator = globalThis.navigator;

    beforeEach(() => {
      globalThis.window = {
        location: { href: "http://localhost:3000/" },
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      } as unknown as Window & typeof globalThis;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      if (originalNavigator) {
        Object.defineProperty(globalThis, "navigator", {
          value: originalNavigator,
          writable: true,
          configurable: true,
        });
      }
      delete (globalThis as { window?: unknown }).window;
    });

    it("evaluates prefers-reduced-motion: reduce to stay on static poster", () => {
      globalThis.window = {
        location: { href: "http://localhost:3000/" },
        matchMedia: vi.fn().mockReturnValue({ matches: true }),
      } as unknown as Window & typeof globalThis;

      expect(evaluateHardwareGating()).toBe(true);
    });

    it("evaluates saveData connection flag to stay on static poster", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          connection: { saveData: true },
          hardwareConcurrency: 8,
          deviceMemory: 8,
        },
        writable: true,
        configurable: true,
      });

      expect(evaluateHardwareGating()).toBe(true);
    });

    it("evaluates deviceMemory < 4 to stay on static poster", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (Linux; Android 10)",
          hardwareConcurrency: 8,
          deviceMemory: 2,
        },
        writable: true,
        configurable: true,
      });

      expect(evaluateHardwareGating()).toBe(true);
    });

    it("evaluates low core count (< 4) on non-Apple devices to stay on static poster", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (Linux; Android 10)",
          hardwareConcurrency: 2,
          deviceMemory: 6,
        },
        writable: true,
        configurable: true,
      });

      expect(evaluateHardwareGating()).toBe(true);
    });

    it("accounts for Apple / Safari 2-core clamping heuristic and does not false-positive", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
          hardwareConcurrency: 2, // Safari clamps to 2
          deviceMemory: 8,
        },
        writable: true,
        configurable: true,
      });

      // Should NOT gate Apple device due to clamped cores
      expect(evaluateHardwareGating()).toBe(false);
    });

    it("stays on static poster when degradation='force-static'", () => {
      const html = renderToString(
        <ShadowBackground
          basePlate="/images/base.svg"
          caster={{ type: "branch" }}
          degradation="force-static"
        />
      );

      expect(html).not.toContain("<canvas");
      expect(html).toContain("data-nimg=\"fill\"");
    });
  });

  describe("4. Cooperative Idle Hydration & force-dynamic", () => {
    let mockElementClass: new (nodeType?: number, nodeName?: string) => {
      nodeType: number;
      nodeName: string;
      tagName: string;
      childNodes: unknown[];
      ownerDocument: unknown;
      style: Record<string, string>;
      attributes: Record<string, string>;
      width: number;
      height: number;
      appendChild: (child: unknown) => unknown;
      removeChild: (child: unknown) => unknown;
      insertBefore: (child: unknown, ref: unknown) => unknown;
      setAttribute: (name: string, value: string) => void;
      getAttribute: (name: string) => string | null;
      removeAttribute: (name: string) => void;
      addEventListener: () => void;
      removeEventListener: () => void;
      getContext: () => unknown;
      getBoundingClientRect: () => { width: number; height: number; top: number; left: number; right: number; bottom: number };
    };

    beforeEach(() => {
      vi.useFakeTimers();

      mockElementClass = class MockNode {
        nodeType: number;
        nodeName: string;
        tagName: string;
        childNodes: unknown[];
        ownerDocument: unknown;
        style: Record<string, string>;
        attributes: Record<string, string>;
        width: number = 800;
        height: number = 600;
        constructor(nodeType = 1, nodeName = "DIV") {
          this.nodeType = nodeType;
          this.nodeName = nodeName;
          this.tagName = nodeName;
          this.childNodes = [];
          this.ownerDocument = globalThis.document;
          this.style = {};
          this.attributes = {};
        }
        appendChild(child: unknown) {
          this.childNodes.push(child);
          return child;
        }
        removeChild(child: unknown) {
          const idx = this.childNodes.indexOf(child);
          if (idx !== -1) this.childNodes.splice(idx, 1);
          return child;
        }
        insertBefore(child: unknown) {
          this.childNodes.push(child);
          return child;
        }
        setAttribute(name: string, value: string) {
          this.attributes[name] = String(value);
        }
        getAttribute(name: string) {
          return this.attributes[name] ?? null;
        }
        removeAttribute(name: string) {
          delete this.attributes[name];
        }
        addEventListener() {}
        removeEventListener() {}
        getContext() {
          return {
            fillRect: () => {},
            clearRect: () => {},
            drawImage: () => {},
            save: () => {},
            restore: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {},
            translate: () => {},
            rotate: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
          };
        }
        getBoundingClientRect() {
          return { width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600 };
        }
      };

      const head = new mockElementClass(1, "HEAD");

      globalThis.Element = mockElementClass as unknown as typeof Element;
      globalThis.HTMLElement = mockElementClass as unknown as typeof HTMLElement;
      globalThis.HTMLDivElement = mockElementClass as unknown as typeof HTMLDivElement;
      globalThis.HTMLImageElement = mockElementClass as unknown as typeof HTMLImageElement;
      globalThis.HTMLCanvasElement = mockElementClass as unknown as typeof HTMLCanvasElement;
      globalThis.HTMLIFrameElement = class {} as unknown as typeof HTMLIFrameElement;
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;

      globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
        return setTimeout(cb, 16) as unknown as number;
      });
      globalThis.cancelAnimationFrame = vi.fn((id: number) => {
        clearTimeout(id as unknown as NodeJS.Timeout);
      });

      globalThis.document = {
        documentElement: { scrollHeight: 1000, clientHeight: 600 } as unknown as HTMLElement,
        createElement: (tag: string) => new mockElementClass(1, tag.toUpperCase()),
        createTextNode: (text: string) => ({ nodeType: 3, nodeValue: text }),
        createComment: () => ({ nodeType: 8 }),
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementsByTagName: () => [],
        activeElement: null,
        head,
        defaultView: globalThis,
        HTMLIFrameElement: class {},
      } as unknown as Document;

      class MockBrowserImage {
        src = "";
        onload: (() => void) | null = null;
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      globalThis.window = {
        ...globalThis,
        Image: MockBrowserImage as unknown as typeof Image,
        location: { href: "http://localhost:3000/" },
        devicePixelRatio: 1,
        scrollY: 0,
        innerHeight: 600,
        addEventListener: () => {},
        removeEventListener: () => {},
        requestAnimationFrame: globalThis.requestAnimationFrame,
        cancelAnimationFrame: globalThis.cancelAnimationFrame,
      } as unknown as Window & typeof globalThis;

      // Enable React act environment flag
      (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      delete (globalThis as { window?: unknown }).window;
      delete (globalThis as { document?: unknown }).document;
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
      delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
      delete (globalThis as { cancelAnimationFrame?: unknown }).cancelAnimationFrame;
    });

    it("defers dynamic engine mount via requestIdleCallback when degradation='force-dynamic'", async () => {
      let idleCallback: (() => void) | null = null;
      const requestIdleCallbackMock = vi.fn((cb: () => void) => {
        idleCallback = cb;
        return 42;
      });
      const cancelIdleCallbackMock = vi.fn();

      (window as unknown as { requestIdleCallback: typeof requestIdleCallbackMock }).requestIdleCallback =
        requestIdleCallbackMock;
      (window as unknown as { cancelIdleCallback: typeof cancelIdleCallbackMock }).cancelIdleCallback =
        cancelIdleCallbackMock;

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-dynamic"
          />
        );
      });

      // requestIdleCallback should have been scheduled cooperatively
      expect(requestIdleCallbackMock).toHaveBeenCalledWith(expect.any(Function), { timeout: 1000 });

      // Trigger the idle callback
      React.act(() => {
        if (idleCallback) (idleCallback as () => void)();
      });

      // Cleanup
      React.act(() => {
        root.unmount();
      });
    });

    it("falls back to setTimeout when requestIdleCallback is unavailable", async () => {
      delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-dynamic"
          />
        );
      });

      // Advance timer for setTimeout fallback (100ms)
      React.act(() => {
        vi.advanceTimersByTime(150);
      });

      // Clean up
      React.act(() => {
        root.unmount();
      });
    });
  });

  describe("5. Pluggable Casters & Adaptive Engine Resolution", () => {
    it("resolves caster type 'image' to WebGlShadowEngine when WebGL is available", () => {
      const caster: ShadowCasterConfig = {
        type: "image",
        src: "/images/custom-caster.png",
        opacity: 0.75,
      };

      const element = resolveShadowEngine({
        caster,
        basePlate: "/images/base.jpg",
        penumbra: 32,
        contactHardening: true,
        shadowOpacity: 0.6,
        lightDirection: [15, 20, 1],
        useCanvasFallback: false,
      });

      expect(element.type).toBe(EngineErrorBoundary);

      const boundaryProps = element.props as unknown as { children: React.ReactElement<WebGlShadowEngineProps> };
      const webGlChild = boundaryProps.children;
      expect(webGlChild.type).toBe(WebGlShadowEngine);
      expect(webGlChild.props.baseImage).toBe("/images/base.jpg");
      expect(webGlChild.props.casterImage).toBe("/images/custom-caster.png");
      expect(webGlChild.props.blurRadius).toBe(32);
      expect(webGlChild.props.contactHardening).toBe(true);
      expect(webGlChild.props.shadowOpacity).toBe(0.75); // caster.opacity overrides shadowOpacity
      expect(webGlChild.props.offsetX).toBe(15);
      expect(webGlChild.props.offsetY).toBe(20);
    });

    it("resolves caster type 'image' to Canvas2dShadowEngine when useCanvasFallback is true", () => {
      const caster: ShadowCasterConfig = {
        type: "image",
        src: "/images/custom-caster.png",
      };

      const element = resolveShadowEngine({
        caster,
        basePlate: "/images/base.jpg",
        penumbra: 24,
        contactHardening: true,
        shadowOpacity: 0.65,
        useCanvasFallback: true,
      });

      expect(element.type).toBe(Canvas2dShadowEngine);
      const props = element.props as unknown as ShadowEngineProps;
      expect(props.baseImage).toBe("/images/base.jpg");
      expect(props.casterImage).toBe("/images/custom-caster.png");
      expect(props.blurRadius).toBe(24);
      expect(props.shadowOpacity).toBe(0.65);
    });

    it("resolves caster type 'komorebi' to ProceduralKomorebiEngine", () => {
      const caster: ShadowCasterConfig = {
        type: "komorebi",
        density: 1.2,
        contrast: 1.4,
        scale: 4.0,
        speed: 0.6,
      };

      const element = resolveShadowEngine({
        caster,
        basePlate: "/images/base.jpg",
        shadowOpacity: 0.5,
        useCanvasFallback: false,
      });

      expect(element.type).toBe(ProceduralKomorebiEngine);
      const props = element.props as unknown as ProceduralKomorebiProps;
      expect(props.basePlate).toBe("/images/base.jpg");
      expect(props.scale).toBe(4.0);
      expect(props.speed).toBe(0.6);
      expect(props.contrast).toBe(1.4);
      expect(props.shadowOpacity).toBeCloseTo(0.5 * 1.2, 5);
      expect(props.mode).toBe("gpu");
    });

    it("resolves caster type 'komorebi' with cpu mode on fallback", () => {
      const caster: ShadowCasterConfig = {
        type: "komorebi",
      };

      const element = resolveShadowEngine({
        caster,
        basePlate: "/images/base.jpg",
        useCanvasFallback: true,
      });

      expect(element.type).toBe(ProceduralKomorebiEngine);
      const props = element.props as unknown as ProceduralKomorebiProps;
      expect(props.mode).toBe("cpu");
    });

    it("resolves caster type 'branch' to ProceduralBranchEngine", () => {
      const caster: ShadowCasterConfig = {
        type: "branch",
        depth: 3,
        leafDensity: 6,
        swaySpeed: 0.85,
      };

      const element = resolveShadowEngine({
        caster,
        basePlate: "/images/base.jpg",
        penumbra: 18,
        shadowOpacity: 0.7,
      });

      expect(element.type).toBe(ProceduralBranchEngine);
      const props = element.props as unknown as ProceduralBranchProps;
      expect(props.basePlate).toBe("/images/base.jpg");
      expect(props.penumbraRadius).toBe(18);
      expect(props.shadowOpacity).toBe(0.7);
      expect(props.branchDepth).toBe(3);
      expect(props.leafDensity).toBe(6);
      expect(props.swaySpeed).toBe(0.85);
    });
  });

  describe("6. EngineErrorBoundary & WebGL Resilience", () => {
    it("renders fallback when a child throws an error", () => {
      const onError = vi.fn();
      const ThrowingComponent = () => {
        throw new Error("WebGL context lost or compilation failed");
      };

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const boundary = new EngineErrorBoundary({
        fallback: <div data-testid="canvas2d-fallback">Canvas2D Fallback</div>,
        onError,
        children: <ThrowingComponent />,
      });

      expect(EngineErrorBoundary.getDerivedStateFromError()).toEqual({ hasError: true });

      boundary.componentDidCatch(new Error("Test failure"));
      expect(onError).toHaveBeenCalledTimes(1);

      boundary.state = { hasError: true };
      const rendered = boundary.render();
      expect(React.isValidElement(rendered)).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it("correctly identifies WebGL support status via isWebGLSupported()", () => {
      expect(isWebGLSupported()).toBe(false);
    });
  });

  describe("7. Interactive Motion, Spring Physics & 3D Parallax Integration", () => {
    let mockElementClass: new (nodeType?: number, nodeName?: string) => {
      nodeType: number;
      nodeName: string;
      tagName: string;
      childNodes: unknown[];
      ownerDocument: unknown;
      style: Record<string, string>;
      attributes: Record<string, string>;
      width: number;
      height: number;
      appendChild: (child: unknown) => unknown;
      removeChild: (child: unknown) => unknown;
      insertBefore: (child: unknown, ref: unknown) => unknown;
      setAttribute: (name: string, value: string) => void;
      getAttribute: (name: string) => string | null;
      removeAttribute: (name: string) => void;
      addEventListener: () => void;
      removeEventListener: () => void;
      getContext: () => unknown;
      getBoundingClientRect: () => { width: number; height: number; top: number; left: number; right: number; bottom: number };
    };

    beforeEach(() => {
      vi.useFakeTimers();

      mockElementClass = class MockNode {
        nodeType: number;
        nodeName: string;
        tagName: string;
        childNodes: unknown[];
        ownerDocument: unknown;
        style: Record<string, string>;
        attributes: Record<string, string>;
        width: number = 800;
        height: number = 600;
        constructor(nodeType = 1, nodeName = "DIV") {
          this.nodeType = nodeType;
          this.nodeName = nodeName;
          this.tagName = nodeName;
          this.childNodes = [];
          this.ownerDocument = globalThis.document;
          this.style = {};
          this.attributes = {};
        }
        appendChild(child: unknown) {
          this.childNodes.push(child);
          return child;
        }
        removeChild(child: unknown) {
          const idx = this.childNodes.indexOf(child);
          if (idx !== -1) this.childNodes.splice(idx, 1);
          return child;
        }
        insertBefore(child: unknown) {
          this.childNodes.push(child);
          return child;
        }
        setAttribute(name: string, value: string) {
          this.attributes[name] = String(value);
        }
        getAttribute(name: string) {
          return this.attributes[name] ?? null;
        }
        removeAttribute(name: string) {
          delete this.attributes[name];
        }
        addEventListener() {}
        removeEventListener() {}
        getContext() {
          return {
            fillRect: () => {},
            clearRect: () => {},
            drawImage: () => {},
            save: () => {},
            restore: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {},
            translate: () => {},
            rotate: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
          };
        }
        getBoundingClientRect() {
          return { width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600 };
        }
      };

      const head = new mockElementClass(1, "HEAD");

      globalThis.Element = mockElementClass as unknown as typeof Element;
      globalThis.HTMLElement = mockElementClass as unknown as typeof HTMLElement;
      globalThis.HTMLDivElement = mockElementClass as unknown as typeof HTMLDivElement;
      globalThis.HTMLImageElement = mockElementClass as unknown as typeof HTMLImageElement;
      globalThis.HTMLCanvasElement = mockElementClass as unknown as typeof HTMLCanvasElement;
      globalThis.HTMLIFrameElement = class {} as unknown as typeof HTMLIFrameElement;
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;

      globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
        return setTimeout(cb, 16) as unknown as number;
      });
      globalThis.cancelAnimationFrame = vi.fn((id: number) => {
        clearTimeout(id as unknown as NodeJS.Timeout);
      });

      globalThis.document = {
        documentElement: { scrollHeight: 1000, clientHeight: 600 } as unknown as HTMLElement,
        createElement: (tag: string) => new mockElementClass(1, tag.toUpperCase()),
        createTextNode: (text: string) => ({ nodeType: 3, nodeValue: text }),
        createComment: () => ({ nodeType: 8 }),
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementsByTagName: () => [],
        activeElement: null,
        head,
        defaultView: globalThis,
        HTMLIFrameElement: class {},
      } as unknown as Document;

      class MockBrowserImage {
        src = "";
        onload: (() => void) | null = null;
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      globalThis.window = {
        ...globalThis,
        Image: MockBrowserImage as unknown as typeof Image,
        location: { href: "http://localhost:3000/" },
        devicePixelRatio: 1,
        scrollY: 0,
        innerHeight: 600,
        addEventListener: () => {},
        removeEventListener: () => {},
        requestAnimationFrame: globalThis.requestAnimationFrame,
        cancelAnimationFrame: globalThis.cancelAnimationFrame,
      } as unknown as Window & typeof globalThis;

      (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      delete (globalThis as { window?: unknown }).window;
      delete (globalThis as { document?: unknown }).document;
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
      delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
      delete (globalThis as { cancelAnimationFrame?: unknown }).cancelAnimationFrame;
    });

    it("configures spring physics from string presets (smooth, snappy, inertial, bouncy)", async () => {
      const motionModule = await import("../hooks/useMotionController");
      const spy = vi.spyOn(motionModule, "useMotionController");

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      // 1. Default (smooth)
      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
          />
        );
      });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          springConfig: SPRING_PRESETS.smooth,
          scrollInfluencePx: 25,
          ambientMotion: true,
        })
      );

      // 2. Snappy preset
      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            motion="snappy"
          />
        );
      });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          springConfig: SPRING_PRESETS.snappy,
        })
      );

      // 3. Inertial preset
      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            motion="inertial"
          />
        );
      });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          springConfig: SPRING_PRESETS.inertial,
        })
      );

      // 4. Bouncy preset
      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            motion="bouncy"
          />
        );
      });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          springConfig: SPRING_PRESETS.bouncy,
        })
      );

      React.act(() => {
        root.unmount();
      });
    });

    it("supports granular object MotionConfig with custom spring parameters and flags", async () => {
      const motionModule = await import("../hooks/useMotionController");
      const spy = vi.spyOn(motionModule, "useMotionController");

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            motion={{
              preset: "snappy",
              stiffness: 320,
              damping: 35,
              mass: 1.4,
              ambient: false,
              ambientSpeed: 1.2,
              ambientStrength: 15,
              maxDisplacementPx: 64,
              scrollInfluence: 42,
            }}
          />
        );
      });

      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          springConfig: {
            stiffness: 320,
            damping: 35,
            mass: 1.4,
          },
          ambientMotion: false,
          ambientSpeed: 1.2,
          ambientStrength: 15,
          maxDisplacementPx: 64,
          scrollInfluencePx: 42,
        })
      );

      // Type-check exported motion contracts
      const typedPreset: MotionPreset = "snappy";
      const typedConfig: MotionConfig = { preset: typedPreset, stiffness: 200 };
      expect(typedConfig.preset).toBe("snappy");

      // Boolean scrollInfluence mappings
      expect(resolveScrollInfluence(true)).toBe(25);
      expect(resolveScrollInfluence(false)).toBe(0);
      expect(resolveScrollInfluence(50)).toBe(50);
      expect(resolveScrollInfluence(undefined)).toBe(25);

      React.act(() => {
        root.unmount();
      });
    });

    it("disables motion listeners, touchAction styling, and dynamic offsets when motion='none'", async () => {
      const motionModule = await import("../hooks/useMotionController");
      const spy = vi.spyOn(motionModule, "useMotionController");

      let idleCallback: (() => void) | null = null;
      (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = vi.fn(
        (cb: () => void) => {
          idleCallback = cb;
          return 1;
        }
      );

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "image", src: "/images/caster-branch.svg" }}
            degradation="force-dynamic"
            motion="none"
            lightDirection={[15, 25, 1]}
          />
        );
      });

      // useMotionController received disabled ambient motion and 0 scroll influence
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          ambientMotion: false,
          scrollInfluencePx: 0,
        })
      );

      // Hydrate dynamic engine
      React.act(() => {
        if (idleCallback) (idleCallback as () => void)();
      });

      const stageDiv = rootNode.childNodes[0] as InstanceType<typeof mockElementClass>;
      expect(stageDiv.getAttribute("data-motion-active")).toBe("false");
      expect(stageDiv.style.touchAction).toBeUndefined();

      // The dynamic engine renders with static base offsets (lightDirection), not dynamic motion
      const bgContainer = stageDiv.childNodes[0] as InstanceType<typeof mockElementClass>;
      const engineWrapper = bgContainer.childNodes[1] as InstanceType<typeof mockElementClass>;
      expect(engineWrapper).toBeDefined();
      expect(engineWrapper.style.transform).toBeUndefined();

      React.act(() => {
        root.unmount();
      });
    });

    it("disables motion when motion={{ preset: 'none' }}", async () => {
      let idleCallback: (() => void) | null = null;
      (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = vi.fn(
        (cb: () => void) => {
          idleCallback = cb;
          return 1;
        }
      );

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-dynamic"
            motion={{ preset: "none" }}
          />
        );
      });

      React.act(() => {
        if (idleCallback) (idleCallback as () => void)();
      });

      const stageDiv = rootNode.childNodes[0] as InstanceType<typeof mockElementClass>;
      expect(stageDiv.getAttribute("data-motion-active")).toBe("false");
      expect(stageDiv.style.touchAction).toBeUndefined();

      React.act(() => {
        root.unmount();
      });
    });

    it("registers touchAction: pan-y and coordinates event handlers when dynamic motion is active", async () => {
      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      let idleCallback: (() => void) | null = null;
      (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = vi.fn(
        (cb: () => void) => {
          idleCallback = cb;
          return 1;
        }
      );

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-dynamic"
            motion="smooth"
          />
        );
      });

      // Hydrate dynamic tier
      React.act(() => {
        if (idleCallback) (idleCallback as () => void)();
      });

      const stageDiv = rootNode.childNodes[0] as InstanceType<typeof mockElementClass>;
      expect(stageDiv.getAttribute("data-motion-active")).toBe("true");
      expect(stageDiv.style.touchAction).toBe("pan-y");

      React.act(() => {
        root.unmount();
      });
    });

    it("forwards ref to the outer container element via React.forwardRef", async () => {
      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      const refObject = React.createRef<HTMLDivElement>();
      let callbackRefNode: HTMLDivElement | null = null;

      React.act(() => {
        root.render(
          <ShadowBackground
            ref={(node) => {
              callbackRefNode = node;
            }}
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-static"
          />
        );
      });

      expect(callbackRefNode).not.toBeNull();
      expect((callbackRefNode as unknown as { tagName: string }).tagName).toBe("DIV");

      React.act(() => {
        root.render(
          <ShadowBackground
            ref={refObject}
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-static"
          />
        );
      });

      expect(refObject.current).not.toBeNull();
      expect((refObject.current as unknown as { tagName: string }).tagName).toBe("DIV");

      React.act(() => {
        root.unmount();
      });
    });

    it("triggers onTierChange callback on initial static-poster tier", async () => {
      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      const tierSpy = vi.fn();

      React.act(() => {
        root.render(
          <ShadowBackground
            tier="force-static"
            onTierChange={tierSpy}
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
          />
        );
      });

      expect(tierSpy).toHaveBeenCalledWith("static-poster");

      React.act(() => {
        root.unmount();
      });
    });

    it("supports canonical ambientMotion config alongside ambient", async () => {
      const motionModule = await import("../hooks/useMotionController");
      const spy = vi.spyOn(motionModule, "useMotionController");

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            motion={{ preset: "snappy", ambientMotion: false }}
          />
        );
      });

      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          ambientMotion: false,
        })
      );

      React.act(() => {
        root.unmount();
      });
    });

    it("verifies pointer and touch handlers update coordinates through the motion controller", () => {
      const controller = new MotionController({
        springConfig: SPRING_PRESETS.snappy,
        maxDisplacementPx: 50,
        ambientMotion: false,
      });

      // Pointer movement to right edge: target moves, shadow offsets to left
      controller.handlePointerMove(200, 100, { left: 0, top: 0, width: 200, height: 200 });
      controller.step(0.016);
      expect(controller.getOutput().shadowOffsetX).toBeLessThan(0);

      // Pointer leave: returns to center neutral
      controller.handlePointerLeave();
      for (let i = 0; i < 60; i++) controller.step(0.016);
      expect(controller.getOutput().shadowOffsetX).toBeCloseTo(0, 1);

      // Touch interaction: touch down & drag
      controller.handleTouchStart(100, 100, { left: 0, top: 0, width: 200, height: 200 });
      controller.handleTouchMove(50, 100, { left: 0, top: 0, width: 200, height: 200 });
      controller.step(0.016);
      expect(controller.getOutput().shadowOffsetX).toBeGreaterThan(0);

      // Touch end releases back to neutral
      controller.handleTouchEnd();
      for (let i = 0; i < 60; i++) controller.step(0.016);
      expect(controller.getOutput().shadowOffsetX).toBeCloseTo(0, 1);
    });

    it("applies 3D perspective distortion style to the dynamic shadow canvas container layer", async () => {
      let idleCallback: (() => void) | null = null;
      (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = vi.fn(
        (cb: () => void) => {
          idleCallback = cb;
          return 1;
        }
      );

      const { createRoot } = await import("react-dom/client");
      const rootNode = new mockElementClass(1, "DIV");
      const root = createRoot(rootNode as unknown as HTMLElement);

      React.act(() => {
        root.render(
          <ShadowBackground
            basePlate="/images/base.svg"
            caster={{ type: "branch" }}
            degradation="force-dynamic"
            motion="smooth"
          />
        );
      });

      // Hydrate dynamic tier
      React.act(() => {
        if (idleCallback) (idleCallback as () => void)();
      });

      const stageDiv = rootNode.childNodes[0] as InstanceType<typeof mockElementClass>;
      const bgContainer = stageDiv.childNodes[0] as InstanceType<typeof mockElementClass>;
      const renderLayer = bgContainer.childNodes[1] as InstanceType<typeof mockElementClass>;

      expect(renderLayer).toBeDefined();
      expect(renderLayer.style.transform).toBe("perspective(1000px) rotateX(0deg) rotateY(0deg)");

      React.act(() => {
        root.unmount();
      });
    });

    it("dilates penumbra and applies dynamic offsets across all engines via resolveShadowEngine", () => {
      const mockMotionOutput: MotionOutput = {
        shadowOffsetX: -28.4,
        shadowOffsetY: 16.8,
        penumbraMultiplier: 1.35,
        skewX: -3.2,
        skewY: 4.8,
        isAtRest: false,
        normalizedUV: { u: 0.85, v: 0.25 },
        virtualLightDirection: { x: -0.5, y: 0.3, z: 0.8 },
        scrollProgress: 0.4,
        scrollDeltaY: 80,
        rawPointer: { x: 350, y: 150 },
      };

      // 1. WebGlShadowEngine: receives dynamic offsets and dilated penumbra
      const webglEl = resolveShadowEngine({
        caster: { type: "image", src: "/caster.png" },
        basePlate: "/base.jpg",
        penumbra: 20,
        useCanvasFallback: false,
        motionOutput: mockMotionOutput,
      });
      const webglChild = (webglEl.props as unknown as { children: React.ReactElement }).children;
      const webglProps = webglChild.props as unknown as WebGlShadowEngineProps;
      expect(webglProps.offsetX).toBe(-28.4);
      expect(webglProps.offsetY).toBe(16.8);
      expect(webglProps.blurRadius).toBe(Math.round(20 * 1.35)); // 27px

      // 2. Canvas2dShadowEngine fallback: receives dynamic offsets and dilated penumbra
      const canvasEl = resolveShadowEngine({
        caster: { type: "image", src: "/caster.png" },
        basePlate: "/base.jpg",
        penumbra: 20,
        useCanvasFallback: true,
        motionOutput: mockMotionOutput,
      });
      const canvasProps = canvasEl.props as unknown as ShadowEngineProps;
      expect(canvasProps.offsetX).toBe(-28.4);
      expect(canvasProps.offsetY).toBe(16.8);
      expect(canvasProps.blurRadius).toBe(27);

      // 3. ProceduralKomorebiEngine: wind angle tilts based on offset (-28.4 * 1.5 + 45 = 2.4°)
      const komorebiEl = resolveShadowEngine({
        caster: { type: "komorebi" },
        basePlate: "/base.jpg",
        motionOutput: mockMotionOutput,
      });
      const komorebiProps = komorebiEl.props as unknown as ProceduralKomorebiProps;
      expect(komorebiProps.windAngle).toBeCloseTo(45 + -28.4 * 1.5, 2);

      // 4. ProceduralBranchEngine: receives dilated penumbraRadius and modulated windStrength
      const branchEl = resolveShadowEngine({
        caster: { type: "branch" },
        basePlate: "/base.jpg",
        penumbra: 16,
        motionOutput: mockMotionOutput,
      });
      const branchProps = branchEl.props as unknown as ProceduralBranchProps;
      expect(branchProps.penumbraRadius).toBe(Math.round(16 * 1.35)); // 22px
      expect(branchProps.windStrength).toBeCloseTo(0.8 + Math.abs(-28.4) * 0.02, 2);
    });
  });
});
