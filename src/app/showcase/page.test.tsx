import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../test-utils/setup-showcase-window";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/showcase" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

// Path alias mocks matching repository conventions
vi.mock("@/components/ShadowBackground", async () => {
  return await vi.importActual("../../components/ShadowBackground");
});
vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../components/ShowcaseNav");
});
vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("../../lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("../../lib/procedural/branch-skeleton");
});
vi.mock("@/lib/motion/motion-controller", async () => {
  return await vi.importActual("../../lib/motion/motion-controller");
});
vi.mock("@/lib/motion/spring", async () => {
  return await vi.importActual("../../lib/motion/spring");
});
vi.mock("@/hooks/useMotionController", async () => {
  return await vi.importActual("../../hooks/useMotionController");
});
vi.mock("@/lib/device-capabilities", async () => {
  return await vi.importActual("../../lib/device-capabilities");
});

import ShowcaseGalleryPage from "./page";
import ShowcaseLayout from "./layout";
import { ShowcaseNav } from "@/components/ShowcaseNav";

describe("Showcase Gallery Hub & Shell Navigation (Issue #22)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/showcase";
    env = setupShowcaseWindow("http://localhost:3000/showcase");
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("renders the gallery hub header, title, and study suite overview", async () => {
    await act(async () => {
      root?.render(<ShowcaseGalleryPage />);
    });

    expect(rootContainer.textContent).toContain("Dynamic Shadowcasting Gallery");
    expect(rootContainer.textContent).toContain("DESIGN STUDIES SUITE • SPEC #21");
    expect(rootContainer.textContent).toContain(
      "A curated suite of four real-world design studies"
    );
  });

  it("renders preview cards and links for all 4 design studies", async () => {
    await act(async () => {
      root?.render(<ShowcaseGalleryPage />);
    });

    // Check all 4 studies exist by id and have titles and links
    const expectedStudies = [
      { id: "wood-header", route: "/showcase/wood-header", title: "Architectural Wood Header" },
      { id: "decayed-paint", route: "/showcase/decayed-paint", title: "Decayed Paint Industrial" },
      { id: "scroll-top", route: "/showcase/scroll-top", title: "Scroll Parallax Hero" },
      { id: "scroll-mid", route: "/showcase/scroll-mid", title: "Mid-Article Shadow Break" },
    ];

    for (const study of expectedStudies) {
      const card = rootContainer.querySelector(`[data-testid="showcase-card-${study.id}"]`);
      expect(card).not.toBeNull();
      expect(card?.textContent).toContain(study.title);

      const link = card?.querySelector(`a[href="${study.route}"]`);
      expect(link).not.toBeNull();
      expect(link?.getAttribute("href")).toBe(study.route);
    }

    // Verify asset pairings and techniques are listed in each card
    expect(rootContainer.textContent).toContain("wood-background.webp");
    expect(rootContainer.textContent).toContain("decayedpaint-background.webp");
    expect(rootContainer.textContent).toContain("grass.svg");
    expect(rootContainer.textContent).toContain("shadow-2.webp");
    expect(rootContainer.textContent).toContain("Decoupled Static Base Plate");
    expect(rootContainer.textContent).toContain("Poisson Disk Soft Shadow");
  });

  it("renders ShowcaseNav floating navbar with all 7 navigation links", async () => {
    currentPathname.value = "/showcase";

    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const nav = rootContainer.querySelector('[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();

    const links = Array.from(rootContainer.querySelectorAll("a"));
    expect(links).toHaveLength(9);

    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual([
      "/",
      "/showcase",
      "/showcase/wood-header",
      "/showcase/decayed-paint",
      "/showcase/scroll-top",
      "/showcase/scroll-mid",
      "/conclusions",
      "/guide",
      "/presentation",
    ]);

    const labels = links.map((l) => l.textContent?.trim());
    expect(labels).toEqual([
      "← Playground",
      "Gallery",
      "Wood Header",
      "Decayed Paint",
      "Scroll Top",
      "Scroll Mid",
      "Conclusions",
      "Engineering Guide",
      "Design Deck",
    ]);
  });

  it("highlights the active link pill based on usePathname()", async () => {
    // 1. On /showcase: Gallery should be active
    currentPathname.value = "/showcase";
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    let galleryLink = rootContainer.querySelector('a[href="/showcase"]');
    let woodLink = rootContainer.querySelector('a[href="/showcase/wood-header"]');
    expect(galleryLink?.getAttribute("aria-current")).toBe("page");
    expect(galleryLink?.getAttribute("data-active")).toBe("true");
    expect(woodLink?.getAttribute("aria-current")).toBeNull();
    expect(woodLink?.getAttribute("data-active")).toBe("false");

    // 2. On /showcase/wood-header: Wood Header should be active
    currentPathname.value = "/showcase/wood-header";
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    galleryLink = rootContainer.querySelector('a[href="/showcase"]');
    woodLink = rootContainer.querySelector('a[href="/showcase/wood-header"]');
    expect(galleryLink?.getAttribute("aria-current")).toBeNull();
    expect(galleryLink?.getAttribute("data-active")).toBe("false");
    expect(woodLink?.getAttribute("aria-current")).toBe("page");
    expect(woodLink?.getAttribute("data-active")).toBe("true");

    // 3. On /: Playground should be active
    currentPathname.value = "/";
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const playgroundLink = rootContainer.querySelector('a[href="/"]');
    expect(playgroundLink?.getAttribute("aria-current")).toBe("page");
    expect(playgroundLink?.getAttribute("data-active")).toBe("true");

    // 4. On /conclusions: Conclusions should be active
    currentPathname.value = "/conclusions";
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const conclusionsLink = rootContainer.querySelector('a[href="/conclusions"]');
    expect(conclusionsLink?.getAttribute("aria-current")).toBe("page");
    expect(conclusionsLink?.getAttribute("data-active")).toBe("true");
  });

  it("renders ShowcaseLayout wrapping children with ShowcaseNav and dark canvas", async () => {
    currentPathname.value = "/showcase";

    await act(async () => {
      root?.render(
        <ShowcaseLayout>
          <div data-testid="test-child">Child Content</div>
        </ShowcaseLayout>
      );
    });

    // Nav is present
    const nav = rootContainer.querySelector('[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();

    // Child is present
    const child = rootContainer.querySelector('[data-testid="test-child"]');
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe("Child Content");
  });

  it("strictly renders ZERO playground controls (no sliders, tier buttons, or diagnostic HUD)", async () => {
    await act(async () => {
      root?.render(
        <ShowcaseLayout>
          <ShowcaseGalleryPage />
        </ShowcaseLayout>
      );
    });

    // Zero range sliders
    const rangeSliders = rootContainer.querySelectorAll('input[type="range"]');
    expect(rangeSliders).toHaveLength(0);

    // Zero Diagnostic HUD elements
    const diagnosticHud = rootContainer.querySelector('[data-testid="diagnostic-hud"]');
    expect(diagnosticHud).toBeNull();
    expect(rootContainer.innerHTML).not.toContain("Diagnostics HUD Active");
    expect(rootContainer.innerHTML).not.toContain("CPU Stress Test");

    // Zero tier override buttons
    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const tierButton = buttons.find(
      (b) =>
        b.textContent?.includes("Force Static") ||
        b.textContent?.includes("Force Dynamic") ||
        b.textContent?.includes("Auto (Gated)")
    );
    expect(tierButton).toBeUndefined();
  });
});
