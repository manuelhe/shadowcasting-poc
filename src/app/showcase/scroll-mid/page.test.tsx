import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/showcase/scroll-mid" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

// Path alias mocks matching repository conventions
vi.mock("@/components/ShadowBackground", async () => {
  return await vi.importActual("../../../components/ShadowBackground");
});
vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../../components/ShowcaseNav");
});
vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("../../../lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("../../../lib/procedural/branch-skeleton");
});
vi.mock("@/lib/motion/motion-controller", async () => {
  return await vi.importActual("../../../lib/motion/motion-controller");
});
vi.mock("@/lib/motion/spring", async () => {
  return await vi.importActual("../../../lib/motion/spring");
});
vi.mock("@/hooks/useMotionController", async () => {
  return await vi.importActual("../../../hooks/useMotionController");
});
vi.mock("@/lib/device-capabilities", async () => {
  return await vi.importActual("../../../lib/device-capabilities");
});

import ScrollMidShowcasePage from "./page";
import ShowcaseLayout from "../layout";
import { resolveShadowEngine } from "@/components/ShadowBackground";
import * as useMotionControllerModule from "@/hooks/useMotionController";
import { clearDeviceCapabilitiesCache } from "@/lib/device-capabilities";

describe("Mid-Article Scroll-Animated Feature Showcase (/showcase/scroll-mid - Issue #26)", () => {
  let window: GlobalWindow;
  let rootContainer: HTMLElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    clearDeviceCapabilitiesCache();
    currentPathname.value = "/showcase/scroll-mid";

    window = new GlobalWindow({ url: "http://localhost:3000/showcase/scroll-mid" });
    Object.defineProperty(global, "window", { value: window, configurable: true, writable: true });
    Object.defineProperty(global, "document", { value: window.document, configurable: true, writable: true });
    Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true, writable: true });
    Object.defineProperty(global, "self", { value: window, configurable: true, writable: true });
    Object.defineProperty(global, "requestAnimationFrame", {
      value: (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "cancelAnimationFrame", {
      value: (id: number) => clearTimeout(id),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "addEventListener", {
      value: window.addEventListener.bind(window),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "removeEventListener", {
      value: window.removeEventListener.bind(window),
      configurable: true,
      writable: true,
    });

    if (typeof global.ResizeObserver === "undefined") {
      Object.defineProperty(global, "ResizeObserver", {
        value: class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
        configurable: true,
        writable: true,
      });
    }

    if (typeof global.IntersectionObserver === "undefined") {
      Object.defineProperty(global, "IntersectionObserver", {
        value: class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
        configurable: true,
        writable: true,
      });
    }

    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    rootContainer = div as unknown as HTMLElement;
    root = createRoot(rootContainer);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    window.close();
    clearDeviceCapabilitiesCache();
    vi.restoreAllMocks();
  });

  it("renders mid-page shadow break with <ShadowBackground /> pairing decayedpaint-background.webp and shadow-1.webp", async () => {
    const motionSpy = vi.spyOn(useMotionControllerModule, "useMotionController");

    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    // 1. Mid-page break container exists with exact specified tailwind classes
    const breakSection = rootContainer.querySelector('[data-testid="mid-page-shadow-break"]');
    expect(breakSection).not.toBeNull();
    expect(breakSection?.className).toContain("relative");
    expect(breakSection?.className).toContain("w-full");
    expect(breakSection?.className).toContain("h-[650px]");
    expect(breakSection?.className).toContain("my-16");
    expect(breakSection?.className).toContain("overflow-hidden");
    expect(breakSection?.className).toContain("rounded-2xl");
    expect(breakSection?.className).toContain("border");
    expect(breakSection?.className).toContain("border-neutral-800");
    expect(breakSection?.className).toContain("shadow-2xl");

    // 2. Motion controller was initialized with scrollInfluence: 100, maxDisplacement: 45, ambient: true
    expect(motionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollInfluencePx: 100,
        maxDisplacementPx: 45,
        ambientMotion: true,
      })
    );

    // 3. Base Plate substrate image renders with decayedpaint-background.webp
    const images = Array.from(breakSection?.querySelectorAll("img") ?? []);
    const basePlateImg = images.find((img) =>
      img.getAttribute("src")?.includes("decayedpaint-background.webp")
    );
    expect(basePlateImg).toBeDefined();

    // 4. Verify ShadowBackground root container classes and attributes
    const bgContainer = breakSection?.querySelector('[data-fit="cover"]');
    expect(bgContainer).not.toBeNull();
    expect(bgContainer?.className).toContain("absolute");
    expect(bgContainer?.className).toContain("inset-0");

    // 5. Verify resolveShadowEngine resolves shadow-1.webp caster with penumbra 26 and opacity 0.85
    const fallbackEngine = resolveShadowEngine({
      caster: "/images/shadow-1.webp",
      basePlate: "/images/decayedpaint-background.webp",
      shadowOpacity: 0.85,
      penumbra: 26,
      shadowColor: "#050505",
      useCanvasFallback: true,
    });
    expect(fallbackEngine.props.casterImage).toBe("/images/shadow-1.webp");
    expect(fallbackEngine.props.blurRadius).toBe(26);
    expect(fallbackEngine.props.shadowOpacity).toBe(0.85);
    expect(fallbackEngine.props.shadowColor).toBe("#050505");
  });

  it("renders introductory editorial article content, title 'THE ANATOMY OF TEXTURE', and metadata", async () => {
    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    // 1. Article title
    const title = rootContainer.querySelector('[data-testid="article-title"]');
    expect(title).not.toBeNull();
    expect(title?.textContent?.trim()).toBe("THE ANATOMY OF TEXTURE");
    expect(title?.className).toContain("text-white");

    // 2. Metadata bar
    const metadataBar = rootContainer.querySelector('[data-testid="article-metadata"]');
    expect(metadataBar).not.toBeNull();
    expect(metadataBar?.textContent).toContain("Materials Research Group");
    expect(metadataBar?.textContent).toContain("Autumn 2026");
    expect(metadataBar?.textContent).toContain("8 min");

    // 3. Opening multi-paragraph analysis
    const intro = rootContainer.querySelector('[data-testid="introductory-content"]');
    expect(intro).not.toBeNull();
    expect(intro?.textContent).toContain("In physical architecture, materiality is not defined by flat pigmentation alone");
    expect(intro?.textContent).toContain("Grazing incident light catches the jagged micro-crests");
    expect(intro?.textContent).toContain("decoupling an unmoving static Base Plate from a transparent dynamic shadow canvas");
  });

  it("renders stylized white pull-quote over mid-page shadow break: 'SURFACE DEGREDATION AS A LIGHT-HARVESTING MEDIUM'", async () => {
    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    const pullQuote = rootContainer.querySelector('[data-testid="mid-page-pullquote"]');
    expect(pullQuote).not.toBeNull();
    expect(pullQuote?.textContent).toContain("SURFACE DEGREDATION AS A LIGHT-HARVESTING MEDIUM");
    expect(pullQuote?.textContent).toContain("Industrial Surface Metallurgy, Archival Monograph");
  });

  it("renders concluding editorial content, case study findings, and specifications", async () => {
    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    const concluding = rootContainer.querySelector('[data-testid="concluding-content"]');
    expect(concluding).not.toBeNull();

    // Section 02
    expect(concluding?.textContent).toContain("II. The Physics of Decoupled Occlusion");
    expect(concluding?.textContent).toContain("decayedpaint-background.webp");
    expect(concluding?.textContent).toContain("shadow-1.webp");

    // Technical specifications grid
    expect(concluding?.textContent).toContain("100px");
    expect(concluding?.textContent).toContain("Scroll Influence");
    expect(concluding?.textContent).toContain("26px");
    expect(concluding?.textContent).toContain("Penumbra Softening");
    expect(concluding?.textContent).toContain("0.85");
    expect(concluding?.textContent).toContain("Optical Density");

    // Section 03
    expect(concluding?.textContent).toContain("III. Viewport-Relative Reading Dynamics");
    expect(concluding?.textContent).toContain("Hardware Degradation Tier");

    // Navigation links
    const galleryLink = concluding?.querySelector('a[href="/showcase"]');
    expect(galleryLink).not.toBeNull();
    const scrollTopLink = concluding?.querySelector('a[href="/showcase/scroll-top"]');
    expect(scrollTopLink).not.toBeNull();
  });

  it("tracks element-relative viewport scroll position and updates parallax offsets upon scroll events", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    // 1. Window scroll listener registered with passive: true
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true }
    );

    const breakSection = rootContainer.querySelector('[data-testid="mid-page-shadow-break"]') as HTMLElement;
    expect(breakSection).not.toBeNull();

    // 2. Simulate break section approaching/entering viewport
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true, writable: true });

    // Mock getBoundingClientRect when element enters viewport (top = 200, height = 650, bottom = 850)
    // totalDistance = 800 + 650 = 1450
    // currentDistance = 800 - 200 = 600
    // expected progress = 600 / 1450 ≈ 0.414
    vi.spyOn(breakSection, "getBoundingClientRect").mockReturnValue({
      top: 200,
      bottom: 850,
      left: 0,
      right: 1000,
      width: 1000,
      height: 650,
      x: 0,
      y: 200,
      toJSON: () => {},
    });

    await act(async () => {
      window.dispatchEvent(new window.Event("scroll"));
    });

    const progressEntry = parseFloat(breakSection.getAttribute("data-scroll-progress") || "0");
    expect(progressEntry).toBeGreaterThan(0.35);
    expect(progressEntry).toBeLessThan(0.45);

    // 3. Simulate break section traversed past center (top = -200, bottom = 450)
    // currentDistance = 800 - (-200) = 1000
    // expected progress = 1000 / 1450 ≈ 0.690
    vi.spyOn(breakSection, "getBoundingClientRect").mockReturnValue({
      top: -200,
      bottom: 450,
      left: 0,
      right: 1000,
      width: 1000,
      height: 650,
      x: 0,
      y: -200,
      toJSON: () => {},
    });

    await act(async () => {
      window.dispatchEvent(new window.Event("scroll"));
    });

    const progressExit = parseFloat(breakSection.getAttribute("data-scroll-progress") || "0");
    expect(progressExit).toBeGreaterThan(progressEntry);
    expect(progressExit).toBeGreaterThan(0.65);
    expect(progressExit).toBeLessThan(0.75);

    // 4. Parallax offset is updated and non-zero
    const parallaxOffset = parseFloat(breakSection.getAttribute("data-parallax-offset") || "0");
    expect(parallaxOffset).not.toBe(0);
  });

  it("strictly contains zero developer controls, sliders, or diagnostic HUDs in the DOM", async () => {
    await act(async () => {
      root?.render(<ScrollMidShowcasePage />);
    });

    // Zero input elements of any kind
    const inputs = rootContainer.querySelectorAll("input");
    expect(inputs.length).toBe(0);

    // Zero range sliders
    const rangeSliders = rootContainer.querySelectorAll('input[type="range"]');
    expect(rangeSliders.length).toBe(0);

    // Zero diagnostic HUD containers
    const hud = rootContainer.querySelector('[data-testid="diagnostic-hud"]');
    expect(hud).toBeNull();

    // Zero telemetry HUD labels
    expect(rootContainer.textContent).not.toContain("VRAM Footprint");
    expect(rootContainer.textContent).not.toContain("Force Static");
    expect(rootContainer.textContent).not.toContain("Low Dynamic");
    expect(rootContainer.textContent).not.toContain("Full Dynamic");
  });

  it("renders inside ShowcaseLayout with /showcase/scroll-mid highlighted in ShowcaseNav", async () => {
    currentPathname.value = "/showcase/scroll-mid";

    await act(async () => {
      root?.render(
        <ShowcaseLayout>
          <ScrollMidShowcasePage />
        </ShowcaseLayout>
      );
    });

    // ShowcaseNav exists
    const nav = rootContainer.querySelector('[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();

    // Active link is /showcase/scroll-mid
    const activeLink = nav?.querySelector('a[aria-current="page"]');
    expect(activeLink).not.toBeNull();
    expect(activeLink?.getAttribute("href")).toBe("/showcase/scroll-mid");
    expect(activeLink?.textContent?.trim()).toBe("Scroll Mid");
    expect(activeLink?.getAttribute("data-active")).toBe("true");
  });
});
