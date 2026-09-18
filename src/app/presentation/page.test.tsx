import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../test-utils/setup-showcase-window";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/presentation" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../components/ShowcaseNav");
});

import PresentationPage from "./page";

describe("Design Team Presentation Page Route (/presentation)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/presentation";
    env = setupShowcaseWindow("http://localhost:3000/presentation");
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("renders /presentation page without runtime exceptions", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    expect(rootContainer).not.toBeNull();
    const main = rootContainer.querySelector("main");
    expect(main).not.toBeNull();
  });

  it("renders the first slide by default with title and slide badge", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    const slideCard = rootContainer.querySelector('[data-testid="presentation-slide-card"]');
    expect(slideCard).not.toBeNull();
    expect(slideCard?.textContent).toContain("Living Light & Dynamic Shadows");
    expect(slideCard?.textContent).toContain("Slide 1 of 10");
  });

  it("advances to the next slide when the Next button is clicked", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    const nextBtn = rootContainer.querySelector('[data-testid="next-slide-btn"]');
    expect(nextBtn).not.toBeNull();

    await act(async () => {
      nextBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });

    const slideCard = rootContainer.querySelector('[data-testid="presentation-slide-card"]');
    expect(slideCard?.textContent).toContain("The Status Quo Dilemma");
    expect(slideCard?.textContent).toContain("Slide 2 of 10");
  });

  it("navigates to previous slide when Previous button is clicked", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    const nextBtn = rootContainer.querySelector('[data-testid="next-slide-btn"]');
    const prevBtn = rootContainer.querySelector('[data-testid="prev-slide-btn"]');

    // Go to slide 2
    await act(async () => {
      nextBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
    expect(rootContainer.textContent).toContain("Slide 2 of 10");

    // Go back to slide 1
    await act(async () => {
      prevBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
    expect(rootContainer.textContent).toContain("Slide 1 of 10");
  });

  it("toggles the speaker notes panel", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    const notesPanelBefore = rootContainer.querySelector('[data-testid="speaker-notes-panel"]');
    expect(notesPanelBefore).not.toBeNull();

    // Find toggle button
    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const toggleBtn = buttons.find((b) => b.textContent?.includes("Speaker Notes"));
    expect(toggleBtn).toBeDefined();

    // Toggle off
    await act(async () => {
      toggleBtn?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
    const notesPanelAfter = rootContainer.querySelector('[data-testid="speaker-notes-panel"]');
    expect(notesPanelAfter).toBeNull();
  });

  it("supports keyboard arrow navigation", async () => {
    await act(async () => {
      root?.render(<PresentationPage />);
    });

    expect(rootContainer.textContent).toContain("Slide 1 of 10");

    // Press ArrowRight
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(rootContainer.textContent).toContain("Slide 2 of 10");

    // Press ArrowLeft
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    });
    expect(rootContainer.textContent).toContain("Slide 1 of 10");
  });
});
