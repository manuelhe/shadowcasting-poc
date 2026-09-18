import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../../test-utils/setup-showcase-window";

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

describe("Architectural Wood & Stylized Serif Typography Showcase (Issue #23)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/showcase/wood-header";
    env = setupShowcaseWindow("http://localhost:3000/showcase/wood-header");
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
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

  it("embeds <ShadowBackground /> configured with wood-background.webp and grass.svg", async () => {
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
    expect(rootContainer.textContent).toContain("CASTER: GRASS.SVG");
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
