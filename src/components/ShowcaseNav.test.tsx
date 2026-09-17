import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../test-utils/setup-showcase-window";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

import { ShowcaseNav, SHOWCASE_NAV_LINKS } from "./ShowcaseNav";

describe("ShowcaseNav Component (Issue #38)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/";
    env = setupShowcaseWindow("http://localhost:3000/");
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("exports SHOWCASE_NAV_LINKS containing the Conclusions route", () => {
    const conclusionsEntry = SHOWCASE_NAV_LINKS.find((link) => link.href === "/conclusions");
    expect(conclusionsEntry).toBeDefined();
    expect(conclusionsEntry?.label).toBe("Conclusions");
  });

  it("renders a semantic navigation landmark with aria-label", async () => {
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const nav = rootContainer.querySelector('nav[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("data-testid")).toBe("showcase-nav");
  });

  it("renders all navigation links including /conclusions", async () => {
    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const links = Array.from(rootContainer.querySelectorAll("a"));
    expect(links).toHaveLength(SHOWCASE_NAV_LINKS.length);

    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/conclusions");

    const conclusionsEl = rootContainer.querySelector('a[href="/conclusions"]');
    expect(conclusionsEl).not.toBeNull();
    expect(conclusionsEl?.textContent?.trim()).toBe("Conclusions");
  });

  it("highlights /conclusions with active attributes and styles when pathname is /conclusions", async () => {
    currentPathname.value = "/conclusions";

    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const conclusionsEl = rootContainer.querySelector('a[href="/conclusions"]');
    expect(conclusionsEl).not.toBeNull();
    expect(conclusionsEl?.getAttribute("aria-current")).toBe("page");
    expect(conclusionsEl?.getAttribute("data-active")).toBe("true");
    expect(conclusionsEl?.className).toContain("bg-zinc-100");
    expect(conclusionsEl?.className).toContain("text-zinc-950");

    // Other links should not be active
    const galleryEl = rootContainer.querySelector('a[href="/showcase"]');
    expect(galleryEl?.getAttribute("aria-current")).toBeNull();
    expect(galleryEl?.getAttribute("data-active")).toBe("false");
    expect(galleryEl?.className).toContain("text-zinc-400");
  });

  it("marks /conclusions as inactive when on another route", async () => {
    currentPathname.value = "/showcase/wood-header";

    await act(async () => {
      root?.render(<ShowcaseNav />);
    });

    const conclusionsEl = rootContainer.querySelector('a[href="/conclusions"]');
    expect(conclusionsEl?.getAttribute("aria-current")).toBeNull();
    expect(conclusionsEl?.getAttribute("data-active")).toBe("false");
    expect(conclusionsEl?.className).toContain("text-zinc-400");

    const activeEl = rootContainer.querySelector('a[href="/showcase/wood-header"]');
    expect(activeEl?.getAttribute("aria-current")).toBe("page");
    expect(activeEl?.getAttribute("data-active")).toBe("true");
  });
});
