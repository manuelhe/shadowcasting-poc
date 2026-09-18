import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../test-utils/setup-showcase-window";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/guide" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../components/ShowcaseNav");
});

vi.mock("../../components/ShadowBackground", () => {
  return {
    ShadowBackground: (props: Record<string, unknown>) => {
      return (
        <div
          data-testid="shadow-background-mock"
          data-base-plate={props.basePlate as string}
          data-penumbra={props.penumbra as number}
          data-contact-hardening={String(props.contactHardening)}
          data-shadow-opacity={props.shadowOpacity as number}
          className={props.className as string}
        >
          {props.children as React.ReactNode}
        </div>
      );
    },
  };
});

import GuidePage from "./page";

describe("Engineering Guide Page Route (/guide)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/guide";
    env = setupShowcaseWindow("http://localhost:3000/guide");
    rootContainer = env.rootContainer;
    root = env.root;

    // Mock clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("renders /guide page without runtime exceptions", async () => {
    await act(async () => {
      root?.render(<GuidePage />);
    });

    expect(rootContainer).not.toBeNull();
    const main = rootContainer.querySelector("main");
    expect(main).not.toBeNull();
  });

  it("renders the developer documentation header, title, subtitle, and badge metrics", async () => {
    await act(async () => {
      root?.render(<GuidePage />);
    });

    const kicker = rootContainer.querySelector('[data-testid="guide-kicker"]');
    expect(kicker).not.toBeNull();
    expect(kicker?.textContent).toContain("Engineering Implementation Guide");

    const title = rootContainer.querySelector('[data-testid="guide-title"]');
    expect(title).not.toBeNull();
    expect(title?.textContent).toContain("<ShadowBackground /> Architecture & Developer Manual");

    expect(rootContainer.textContent).toContain("0 KB Base Plate VRAM");
    expect(rootContainer.textContent).toContain("0.000 CLS Guaranteed");
  });

  it("renders the interactive recipe workbench with tab buttons", async () => {
    await act(async () => {
      root?.render(<GuidePage />);
    });

    const tab0 = rootContainer.querySelector('[data-testid="recipe-tab-0"]');
    const tab1 = rootContainer.querySelector('[data-testid="recipe-tab-1"]');
    expect(tab0).not.toBeNull();
    expect(tab1).not.toBeNull();

    // Initial recipe
    expect(rootContainer.textContent).toContain("1. Minimal Photographic Hero with Vector Branch Caster");

    // Click recipe 1 (Komorebi)
    await act(async () => {
      tab1?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });

    expect(rootContainer.textContent).toContain("2. Procedural Komorebi Sunlight on Studio Wall");
  });

  it("copies code to clipboard when the Copy button is clicked", async () => {
    await act(async () => {
      root?.render(<GuidePage />);
    });

    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const copyBtn = buttons.find((b) => b.textContent?.includes("Copy"));
    expect(copyBtn).toBeDefined();

    await act(async () => {
      copyBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(rootContainer.textContent).toContain("Copied!");
  });

  it("renders the architectural foundations and props reference table", async () => {
    await act(async () => {
      root?.render(<GuidePage />);
    });

    expect(rootContainer.textContent).toContain("Architectural Foundations (ADR-0001 & ADR-0002)");
    expect(rootContainer.textContent).toContain("<ShadowBackground /> Props Specification");

    const table = rootContainer.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain("basePlate");
    expect(table?.textContent).toContain("caster");
    expect(table?.textContent).toContain("penumbra");
    expect(table?.textContent).toContain("contactHardening");
  });
});
