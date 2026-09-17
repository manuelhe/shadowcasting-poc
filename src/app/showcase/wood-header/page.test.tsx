import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/showcase/wood-header" },
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

import WoodHeaderShowcasePage from "./page";
import ShowcaseLayout from "../layout";
import { clearDeviceCapabilitiesCache } from "@/lib/device-capabilities";

describe("Architectural Wood & Stylized Serif Typography Showcase (Issue #23)", () => {
  let window: GlobalWindow;
  let rootContainer: HTMLElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    clearDeviceCapabilitiesCache();
    currentPathname.value = "/showcase/wood-header";

    window = new GlobalWindow({ url: "http://localhost:3000/showcase/wood-header" });
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
  });

  it("renders a full-viewport hero section with expected container styling", async () => {
    await act(async () => {
      root?.render(<WoodHeaderShowcasePage />);
    });

    const heroSection = rootContainer.firstElementChild;
    expect(heroSection).not.toBeNull();
    expect(heroSection?.className).toContain("min-h-screen");
    expect(heroSection?.className).toContain("relative");
    expect(heroSection?.className).toContain("flex");
    expect(heroSection?.className).toContain("items-center");
    expect(heroSection?.className).toContain("justify-center");
    expect(heroSection?.className).toContain("overflow-hidden");
    expect(heroSection?.className).toContain("bg-neutral-950");
  });

  it("embeds <ShadowBackground /> configured with wood-background.webp and shadow-1.webp", async () => {
    await act(async () => {
      root?.render(<WoodHeaderShowcasePage />);
    });

    // Check base plate image
    const basePlateImg = rootContainer.querySelector('img[src*="wood-background.webp"]');
    expect(basePlateImg).not.toBeNull();
    expect(basePlateImg?.getAttribute("src")).toContain("wood-background.webp");

    // Check ShadowBackground container attributes
    const shadowBg = rootContainer.querySelector('[data-fit="cover"]');
    expect(shadowBg).not.toBeNull();
    expect(shadowBg?.className).toContain("absolute");
    expect(shadowBg?.className).toContain("inset-0");
  });

  it("renders the stylized ultra-large white serif display typography header and architectural badges", async () => {
    await act(async () => {
      root?.render(<WoodHeaderShowcasePage />);
    });

    const title = rootContainer.querySelector('[data-testid="wood-header-title"]');
    expect(title).not.toBeNull();
    expect(title?.textContent).toContain("ORGANIC LIGHT & TIMBER");
    expect(title?.className).toContain("font-serif");
    expect(title?.className).toContain("text-white");

    const subtitle = rootContainer.querySelector('[data-testid="wood-header-subtitle"]');
    expect(subtitle).not.toBeNull();
    expect(subtitle?.textContent).toContain("timber substrate");

    // Architectural badges and specifications
    expect(rootContainer.textContent).toContain("STUDY 01 // ARCHITECTURAL MATERIALITY");
    expect(rootContainer.textContent).toContain("BASE: WOOD-BACKGROUND.WEBP");
    expect(rootContainer.textContent).toContain("CASTER: SHADOW-1.WEBP");
    expect(rootContainer.textContent).toContain("PENUMBRA: 28PX");
  });

  it("strictly renders zero developer controls, sliders, or diagnostic HUDs", async () => {
    await act(async () => {
      root?.render(<WoodHeaderShowcasePage />);
    });

    // Zero range sliders
    const rangeSliders = rootContainer.querySelectorAll('input[type="range"]');
    expect(rangeSliders).toHaveLength(0);

    // Zero diagnostic HUD
    const diagnosticHud = rootContainer.querySelector('[data-testid="diagnostic-hud"]');
    expect(diagnosticHud).toBeNull();
    expect(rootContainer.innerHTML).not.toContain("Diagnostics HUD Active");
    expect(rootContainer.innerHTML).not.toContain("CPU Stress Test");

    // Zero tier buttons
    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const tierButton = buttons.find(
      (b) =>
        b.textContent?.includes("Force Static") ||
        b.textContent?.includes("Force Dynamic") ||
        b.textContent?.includes("Auto (Gated)")
    );
    expect(tierButton).toBeUndefined();
  });

  it("integrates with ShowcaseLayout and highlights /showcase/wood-header as active in ShowcaseNav", async () => {
    currentPathname.value = "/showcase/wood-header";

    await act(async () => {
      root?.render(
        <ShowcaseLayout>
          <WoodHeaderShowcasePage />
        </ShowcaseLayout>
      );
    });

    // ShowcaseNav is rendered
    const nav = rootContainer.querySelector('[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();

    // Wood Header link is active
    const woodLink = rootContainer.querySelector('a[href="/showcase/wood-header"]');
    expect(woodLink).not.toBeNull();
    expect(woodLink?.getAttribute("aria-current")).toBe("page");
    expect(woodLink?.getAttribute("data-active")).toBe("true");

    // Other links are inactive
    const galleryLink = rootContainer.querySelector('a[href="/showcase"]');
    expect(galleryLink?.getAttribute("aria-current")).toBeNull();
    expect(galleryLink?.getAttribute("data-active")).toBe("false");
  });
});
