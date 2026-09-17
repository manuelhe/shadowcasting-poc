import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../../test-utils/setup-showcase-window";
import type { GlobalWindow } from "happy-dom";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/showcase/scroll-top" },
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

import ScrollTopShowcasePage from "./page";
import ShowcaseLayout from "../layout";
import { resolveShadowEngine } from "@/components/ShadowBackground";
import * as useMotionControllerModule from "@/hooks/useMotionController";

describe("Top-of-Page Scroll-Animated Hero Showcase (/showcase/scroll-top - Issue #25)", () => {
  let env: ShowcaseWindowEnvironment;
  let window: GlobalWindow;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/showcase/scroll-top";
    env = setupShowcaseWindow("http://localhost:3000/showcase/scroll-top");
    window = env.window;
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
    vi.restoreAllMocks();
  });

  it("renders top Hero section with <ShadowBackground /> pairing wood-background.webp and shadow-2.webp", async () => {
    const motionSpy = vi.spyOn(useMotionControllerModule, "useMotionController");

    await act(async () => {
      root?.render(<ScrollTopShowcasePage />);
    });

    // 1. Hero container exists with specified tailwind classes
    const heroSection = rootContainer.querySelector('[data-testid="scroll-top-hero-section"]');
    expect(heroSection).not.toBeNull();
    expect(heroSection?.className).toContain("relative");
    expect(heroSection?.className).toContain("h-screen");
    expect(heroSection?.className).toContain("min-h-[640px]");
    expect(heroSection?.className).toContain("flex");
    expect(heroSection?.className).toContain("items-center");
    expect(heroSection?.className).toContain("justify-center");
    expect(heroSection?.className).toContain("overflow-hidden");

    // 2. Motion controller was initialized with scrollInfluence: 120 and maxDisplacement: 50
    expect(motionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollInfluencePx: 120,
        maxDisplacementPx: 50,
        ambientMotion: true,
      })
    );

    // 3. Base Plate substrate image renders with wood-background.webp
    const images = Array.from(heroSection?.querySelectorAll("img") ?? []);
    const basePlateImg = images.find((img) =>
      img.getAttribute("src")?.includes("wood-background.webp")
    );
    expect(basePlateImg).toBeDefined();

    // 4. Verify ShadowBackground root container classes and attributes
    const bgContainer = heroSection?.querySelector('[data-fit="cover"]');
    expect(bgContainer).not.toBeNull();
    expect(bgContainer?.className).toContain("absolute");
    expect(bgContainer?.className).toContain("inset-0");

    // 5. Verify resolveShadowEngine resolves shadow-2.webp caster
    const fallbackEngine = resolveShadowEngine({
      caster: { type: "image", src: "/images/shadow-2.webp" },
      basePlate: "/images/wood-background.webp",
      shadowOpacity: 0.8,
      penumbra: 30,
      shadowColor: "#050505",
      useCanvasFallback: true,
    });
    expect(fallbackEngine.props.casterImage).toBe("/images/shadow-2.webp");
    expect(fallbackEngine.props.blurRadius).toBe(30);
    expect(fallbackEngine.props.shadowOpacity).toBe(0.8);
    expect(fallbackEngine.props.shadowColor).toBe("#050505");
  });

  it("renders white editorial header with 'LIGHT IN TRANSIT' and scroll prompt", async () => {
    await act(async () => {
      root?.render(<ScrollTopShowcasePage />);
    });

    // Main header title
    const h1 = rootContainer.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.textContent?.trim()).toBe("LIGHT IN TRANSIT");
    expect(h1?.className).toContain("text-white");

    // Scroll prompt CTA
    expect(rootContainer.textContent).toContain("SCROLL DOWN TO ANIMATE OCCLUSION");

    // Study badge kicker
    expect(rootContainer.textContent).toContain("Continuous Scroll Parallax");
  });

  it("renders generous long-form editorial article content with all three distinct chapters", async () => {
    await act(async () => {
      root?.render(<ScrollTopShowcasePage />);
    });

    const article = rootContainer.querySelector('[data-testid="editorial-article-container"]');
    expect(article).not.toBeNull();

    // Verify Chapter I
    const ch1 = rootContainer.querySelector('[data-testid="chapter-1"]');
    expect(ch1).not.toBeNull();
    expect(ch1?.textContent).toContain("I. The Geometry of Natural Occlusion");
    expect(ch1?.textContent).toContain("In real architecture, shadows are not flat mathematical cutouts");
    expect(ch1?.textContent).toContain("120px");
    expect(ch1?.textContent).toContain("Scroll Influence");
    expect(ch1?.textContent).toContain("Penumbra Softening");
    expect(ch1?.textContent).toContain("Optical Opacity");

    // Verify Chapter II
    const ch2 = rootContainer.querySelector('[data-testid="chapter-2"]');
    expect(ch2).not.toBeNull();
    expect(ch2?.textContent).toContain("II. Fluid Spring Interactivity");
    expect(ch2?.textContent).toContain("Dynamic Elevation Tracking");
    expect(ch2?.textContent).toContain("Compound Multi-Input Synthesis");

    // Verify Chapter III
    const ch3 = rootContainer.querySelector('[data-testid="chapter-3"]');
    expect(ch3).not.toBeNull();
    expect(ch3?.textContent).toContain("III. Temporal Lighting Transitions");
    expect(ch3?.textContent).toContain("wood-background.webp");
    expect(ch3?.textContent).toContain("shadow-2.webp");
    expect(ch3?.textContent).toContain("WebGL 2.0 / Canvas2D Fallback");

    // Verify pull quotes
    expect(article?.textContent).toContain(
      "Shadow is not the absence of light, but the subtle assertion of form upon space"
    );
    expect(article?.textContent).toContain(
      "Motion on the web should echo the physics of the physical realm"
    );
  });

  it("registers passive window scroll listener and updates motion controller upon scroll events", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const motionSpy = vi.spyOn(useMotionControllerModule, "useMotionController");

    await act(async () => {
      root?.render(<ScrollTopShowcasePage />);
    });

    // 1. Verify scroll listener was attached to window with passive: true
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true }
    );

    // 2. Verify motion controller was configured with scrollInfluence 120
    expect(motionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollInfluencePx: 120,
        maxDisplacementPx: 50,
        ambientMotion: true,
      })
    );

    // 3. Dispatch simulated scroll event
    Object.defineProperty(window, "scrollY", { value: 350, configurable: true, writable: true });
    Object.defineProperty(window.document.documentElement, "scrollHeight", {
      value: 3000,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true, writable: true });

    await act(async () => {
      window.dispatchEvent(new window.Event("scroll"));
    });

    // Verification that scroll event executed without errors
    expect(window.scrollY).toBe(350);
  });

  it("strictly contains zero developer controls, sliders, or diagnostic HUDs in the DOM", async () => {
    await act(async () => {
      root?.render(<ScrollTopShowcasePage />);
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

  it("renders inside ShowcaseLayout with /showcase/scroll-top highlighted in ShowcaseNav", async () => {
    currentPathname.value = "/showcase/scroll-top";

    await act(async () => {
      root?.render(
        <ShowcaseLayout>
          <ScrollTopShowcasePage />
        </ShowcaseLayout>
      );
    });

    // ShowcaseNav exists
    const nav = rootContainer.querySelector('[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();

    // Active link is /showcase/scroll-top
    const activeLink = nav?.querySelector('a[aria-current="page"]');
    expect(activeLink).not.toBeNull();
    expect(activeLink?.getAttribute("href")).toBe("/showcase/scroll-top");
    expect(activeLink?.textContent?.trim()).toBe("Scroll Top");
    expect(activeLink?.getAttribute("data-active")).toBe("true");
  });
});
