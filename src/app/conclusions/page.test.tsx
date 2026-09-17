import React, { act } from "react";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupShowcaseWindow, type ShowcaseWindowEnvironment } from "../../test-utils/setup-showcase-window";

const { currentPathname } = vi.hoisted(() => ({
  currentPathname: { value: "/conclusions" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../components/ShowcaseNav");
});

import ConclusionsPage from "./page";

describe("Executive Conclusions Page Route (/conclusions - Ticket #39)", () => {
  let env: ShowcaseWindowEnvironment;
  let rootContainer: HTMLElement;
  let root: Root;

  beforeEach(() => {
    currentPathname.value = "/conclusions";
    env = setupShowcaseWindow("http://localhost:3000/conclusions");
    rootContainer = env.rootContainer;
    root = env.root;
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it("renders /conclusions page without runtime exceptions", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    expect(rootContainer).not.toBeNull();
    const main = rootContainer.querySelector("main");
    expect(main).not.toBeNull();
  });

  it("renders the executive header, kicker badge, title, subtitle, and status badges", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    // Kicker pill
    const kicker = rootContainer.querySelector('[data-testid="conclusions-kicker"]');
    expect(kicker).not.toBeNull();
    expect(kicker?.textContent).toContain("Executive Briefing • Architectural Synthesis");

    // Title
    const title = rootContainer.querySelector('[data-testid="conclusions-title"]');
    expect(title).not.toBeNull();
    expect(title?.textContent).toContain("Experiment Conclusions & Comparative Technical Analysis");

    // Subtitle explaining problem and thesis
    const subtitle = rootContainer.querySelector('[data-testid="conclusions-subtitle"]');
    expect(subtitle).not.toBeNull();
    expect(subtitle?.textContent).toContain(
      "Ambient backgrounds without the performance, battery, or payload penalties of video loops and 3D engines"
    );

    // Status Badges
    const statusBadges = rootContainer.querySelector('[data-testid="conclusions-status-badges"]');
    expect(statusBadges).not.toBeNull();
    expect(statusBadges?.textContent).toContain("Status: Production Ready");
    expect(statusBadges?.textContent).toContain("Zero-LCP Floor: 0.000 CLS");
    expect(statusBadges?.textContent).toContain("Footprint: ~140 KB");
    expect(statusBadges?.textContent).toContain("Frame Rate: 60 FPS Solid");
  });

  it("renders all three 3-way comparative cards with telemetry badges", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const matrixSection = rootContainer.querySelector('[data-testid="comparative-matrix-section"]');
    expect(matrixSection).not.toBeNull();
    expect(matrixSection?.textContent).toContain("3-Way Paradigm Comparison");

    // Card 1: Pre-Rendered Video / GIFs
    const videoCard = rootContainer.querySelector('[data-testid="comparative-card-video"]');
    expect(videoCard).not.toBeNull();
    expect(videoCard?.textContent).toContain("Pre-Rendered Video / GIFs");
    expect(videoCard?.textContent).toContain("15 MB – 40 MB+");
    expect(videoCard?.textContent).toContain("16 MB – 48 MB");
    expect(videoCard?.textContent).toContain("Non-Reactive");
    expect(videoCard?.textContent).toContain("12% – 28% CPU");

    // Card 2: Full 3D Scene Graphs (Three.js / Spline)
    const threeDCard = rootContainer.querySelector('[data-testid="comparative-card-3d"]');
    expect(threeDCard).not.toBeNull();
    expect(threeDCard?.textContent).toContain("Full 3D Scene Graphs (Three.js / Spline)");
    expect(threeDCard?.textContent).toContain("1.5MB – 5MB");
    expect(threeDCard?.textContent).toContain("60 MB – 120 MB");
    expect(threeDCard?.textContent).toContain("Thermal Throttling");

    // Card 3: Decoupled 2D Dynamic Shadowcasting (Our Approach)
    const decoupledCard = rootContainer.querySelector('[data-testid="comparative-card-decoupled"]');
    expect(decoupledCard).not.toBeNull();
    expect(decoupledCard?.textContent).toContain("Decoupled 2D Dynamic Shadowcasting");
    expect(decoupledCard?.textContent).toContain("~140 KB Total (~99% Less)");
    expect(decoupledCard?.textContent).toContain("0 KB Base Plate VRAM");
    expect(decoupledCard?.textContent).toContain("Solid 60 FPS");
    expect(decoupledCard?.textContent).toContain("< 2% Idle CPU Load");
  });

  it("renders bandwidth & payload infographics with proportional bars and breakdown cards", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const infographicSection = rootContainer.querySelector('[data-testid="bandwidth-infographic-section"]');
    expect(infographicSection).not.toBeNull();

    // Proportional comparison bars
    const comparisonBars = rootContainer.querySelector('[data-testid="payload-comparison-bars"]');
    expect(comparisonBars).not.toBeNull();
    expect(comparisonBars?.textContent).toContain("25,000 KB (100%)");
    expect(comparisonBars?.textContent).toContain("3,500 KB (~14%)");
    expect(comparisonBars?.textContent).toContain("140 KB (~0.5%) • 99% Reduction");

    // Footprint breakdown items
    const basePlateBreakdown = rootContainer.querySelector('[data-testid="breakdown-base-plate"]');
    expect(basePlateBreakdown).not.toBeNull();
    expect(basePlateBreakdown?.textContent).toContain("~120 KB");
    expect(basePlateBreakdown?.textContent).toContain("Stationary Base Plate");

    const shadowCasterBreakdown = rootContainer.querySelector('[data-testid="breakdown-shadow-caster"]');
    expect(shadowCasterBreakdown).not.toBeNull();
    expect(shadowCasterBreakdown?.textContent).toContain("~20 KB");
    expect(shadowCasterBreakdown?.textContent).toContain("Shadow Caster Alpha Mask");

    const runtimeEngineBreakdown = rootContainer.querySelector('[data-testid="breakdown-runtime-engine"]');
    expect(runtimeEngineBreakdown).not.toBeNull();
    expect(runtimeEngineBreakdown?.textContent).toContain("< 5 KB");
    expect(runtimeEngineBreakdown?.textContent).toContain("Runtime Synthesis Engine");

    // Economic analysis callout
    expect(infographicSection?.textContent).toContain("$23,865.00 annually");
  });

  it("renders Core Web Vitals and GPU architecture telemetry cards", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const cwvSection = rootContainer.querySelector('[data-testid="cwv-telemetry-section"]');
    expect(cwvSection).not.toBeNull();

    // Metric 1: 0.000 CLS
    const clsCard = rootContainer.querySelector('[data-testid="telemetry-card-cls"]');
    expect(clsCard).not.toBeNull();
    expect(clsCard?.textContent).toContain("0.000 CLS");
    expect(clsCard?.textContent).toContain("Zero-LCP Floor with SSR Static Poster Fallback");

    // Metric 2: < 600ms FCP / LCP
    const fcpCard = rootContainer.querySelector('[data-testid="telemetry-card-fcp"]');
    expect(fcpCard).not.toBeNull();
    expect(fcpCard?.textContent).toContain("< 600ms");
    expect(fcpCard?.textContent).toContain("First & Largest Contentful Paint");

    // Metric 3: 0 KB Base Plate VRAM
    const vramCard = rootContainer.querySelector('[data-testid="telemetry-card-vram"]');
    expect(vramCard).not.toBeNull();
    expect(vramCard?.textContent).toContain("0 KB VRAM");
    expect(vramCard?.textContent).toContain("Base Plate VRAM Redundancy Elimination");

    // Metric 4: < 2% CPU at 60 FPS
    const cpuCard = rootContainer.querySelector('[data-testid="telemetry-card-cpu"]');
    expect(cpuCard).not.toBeNull();
    expect(cpuCard?.textContent).toContain("< 2% CPU");
    expect(cpuCard?.textContent).toContain("60 FPS Solid with Automatic Resting Sleep");
  });

  it("renders architectural pillars referencing ADR-0001, ADR-0002, and degradation ladder", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const pillarsSection = rootContainer.querySelector('[data-testid="architectural-pillars-section"]');
    expect(pillarsSection).not.toBeNull();

    // Pillar 1: Decoupled Base Plate (ADR-0002)
    const pillar1 = rootContainer.querySelector('[data-testid="pillar-card-decoupled-base-plate"]');
    expect(pillar1).not.toBeNull();
    expect(pillar1?.textContent).toContain("Decoupled Static Base Plate");
    expect(pillar1?.textContent).toContain("ADR-0002");

    // Pillar 2: Contact Hardening & Dual-Filtering (ADR-0001)
    const pillar2 = rootContainer.querySelector('[data-testid="pillar-card-contact-hardening"]');
    expect(pillar2).not.toBeNull();
    expect(pillar2?.textContent).toContain("Contact Hardening & Dual-Filtering");
    expect(pillar2?.textContent).toContain("ADR-0001");
    expect(pillar2?.textContent).toContain("Poisson-disk");
    expect(pillar2?.textContent).toContain("Penumbra");

    // Pillar 3: 3-Tier Degradation Ladder
    const pillar3 = rootContainer.querySelector('[data-testid="pillar-card-degradation-ladder"]');
    expect(pillar3).not.toBeNull();
    expect(pillar3?.textContent).toContain("3-Tier Graceful Degradation Ladder");
    expect(pillar3?.textContent).toContain("WebGL 2.0");
    expect(pillar3?.textContent).toContain("Canvas 2D");
    expect(pillar3?.textContent).toContain("Static Poster");
  });

  it("asserts presence of deep links to live showcase studies and whitepaper document", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    // Deep link to Architectural Timber Hero
    const woodLink = rootContainer.querySelector('[data-testid="cta-wood-header"]');
    expect(woodLink).not.toBeNull();
    expect(woodLink?.getAttribute("href")).toBe("/showcase/wood-header");
    expect(woodLink?.textContent).toContain("Architectural Timber Hero");

    // Deep link to Continuous Scroll Parallax
    const scrollLink = rootContainer.querySelector('[data-testid="cta-scroll-top"]');
    expect(scrollLink).not.toBeNull();
    expect(scrollLink?.getAttribute("href")).toBe("/showcase/scroll-top");
    expect(scrollLink?.textContent).toContain("Continuous Scroll Parallax");

    // Deep link to Decayed Paint
    const decayedLink = rootContainer.querySelector('[data-testid="cta-decayed-paint"]');
    expect(decayedLink).not.toBeNull();
    expect(decayedLink?.getAttribute("href")).toBe("/showcase/decayed-paint");
    expect(decayedLink?.textContent).toContain("Industrial Decayed Paint");

    // Deep link to Interactive Playground
    const playgroundLink = rootContainer.querySelector('[data-testid="cta-playground"]');
    expect(playgroundLink).not.toBeNull();
    expect(playgroundLink?.getAttribute("href")).toBe("/");
    expect(playgroundLink?.textContent).toContain("Interactive Playground");

    // Companion whitepaper card
    const whitepaperCard = rootContainer.querySelector('[data-testid="companion-whitepaper-card"]');
    expect(whitepaperCard).not.toBeNull();
    expect(whitepaperCard?.textContent).toContain("docs/conclusions.md");
  });

  it("renders semantic navigation (ShowcaseNav) with active indicator for /conclusions", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const nav = rootContainer.querySelector('nav[aria-label="Showcase Navigation"]');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("data-testid")).toBe("showcase-nav");

    const conclusionsLink = nav?.querySelector('a[href="/conclusions"]');
    expect(conclusionsLink).not.toBeNull();
    expect(conclusionsLink?.getAttribute("aria-current")).toBe("page");
    expect(conclusionsLink?.getAttribute("data-active")).toBe("true");
  });

  it("STRICT CONSTRAINT: strictly zero interactive developer sliders, range inputs, or diagnostic HUDs in the DOM", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    // No input elements of any kind
    const inputs = rootContainer.querySelectorAll("input");
    expect(inputs.length).toBe(0);

    // Specifically zero range sliders
    const rangeSliders = rootContainer.querySelectorAll('input[type="range"]');
    expect(rangeSliders.length).toBe(0);

    // No select elements
    const selects = rootContainer.querySelectorAll("select");
    expect(selects.length).toBe(0);

    // No textareas
    const textareas = rootContainer.querySelectorAll("textarea");
    expect(textareas.length).toBe(0);

    // No diagnostic HUD elements
    const hud = rootContainer.querySelector('[data-testid="hud"], [data-testid="diagnostic-hud"]');
    expect(hud).toBeNull();
  });

  it("strictly adheres to canonical domain terminology from CONTEXT.md", async () => {
    await act(async () => {
      root?.render(<ConclusionsPage />);
    });

    const text = rootContainer.textContent || "";

    // Canonical terms that must be present
    expect(text).toContain("Base Plate");
    expect(text).toContain("Shadow Caster");
    expect(text).toContain("Penumbra");
    expect(text).toContain("Contact Hardening");
    expect(text).toContain("Zero-LCP Floor");
    expect(text).toContain("Static Poster");

    // Forbidden terms from CONTEXT.md
    expect(text).not.toContain("canvas floor");
    expect(text).not.toContain("occluder");
    expect(text).not.toContain("blur processor");
    expect(text).not.toContain("feathering");
    expect(text).not.toContain("gradient blur");
  });
});
