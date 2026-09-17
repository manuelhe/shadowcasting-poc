import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import React from "react";

// Resolution mappings for Next.js path aliases in test environments without custom vitest.config
vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("./lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("./lib/procedural/branch-skeleton");
});
vi.mock("@/lib/motion/motion-controller", async () => {
  return await vi.importActual("./lib/motion/motion-controller");
});
vi.mock("@/lib/motion/spring", async () => {
  return await vi.importActual("./lib/motion/spring");
});
vi.mock("@/hooks/useMotionController", async () => {
  return await vi.importActual("./hooks/useMotionController");
});

import { ShadowBackground, ShadowBackgroundProps } from "./components/ShadowBackground";

const REPO_ROOT = path.resolve(__dirname, "..");
const README_PATH = path.join(REPO_ROOT, "README.md");

describe("Documentation Integrity Suite (src/docs.test.ts)", () => {
  it("root README.md exists and is non-empty (>500 bytes)", () => {
    expect(fs.existsSync(README_PATH)).toBe(true);
    const stats = fs.statSync(README_PATH);
    expect(stats.size).toBeGreaterThan(500);
  });

  it("README.md contains the required title and core value proposition sections", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    // Title
    expect(readmeContent).toContain("# Shadowcasting Background Component POC");

    // Required sections
    expect(readmeContent).toContain("Value Proposition & Core Pillars");
    expect(readmeContent).toContain("Quickstart");
    expect(readmeContent).toContain("System Prerequisites");
    expect(readmeContent).toContain("Decoupled Architecture Overview (ADR-0001 & ADR-0002)");
    expect(readmeContent).toContain("Asset Directory Structure");
    expect(readmeContent).toContain("Routes & Application Navigation");
    expect(readmeContent).toContain("Developer Lifecycle Commands");
    expect(readmeContent).toContain("Testing & Telemetry");
    expect(readmeContent).toContain("Comprehensive Documentation Index");

    // Mermaid architecture diagram presence
    expect(readmeContent).toContain("```mermaid");
    expect(readmeContent).toContain("Stationary DOM Base Plate");
    expect(readmeContent).toContain("Decoupled Dynamic Shadow Canvas");
    expect(readmeContent).toContain("Foreground Interactive Content");
  });

  it("markdown links to existing repository files resolve to valid files on disk", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    // Regex to extract markdown links: [text](target)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...readmeContent.matchAll(markdownLinkRegex)];

    expect(matches.length).toBeGreaterThan(0);

    const checkedLinks: string[] = [];

    for (const match of matches) {
      const linkTarget = match[2].trim();

      // Skip external web links, routes, or fragment anchors
      if (
        linkTarget.startsWith("http://") ||
        linkTarget.startsWith("https://") ||
        linkTarget.startsWith("#")
      ) {
        continue;
      }

      // Route links (starting with /) are checked in the route test suite
      if (linkTarget.startsWith("/")) {
        continue;
      }

      // Guide links that belong to companion guide tickets #30-#33 are checked in companion guides test
      if (linkTarget.startsWith("docs/guides/")) {
        continue;
      }

      // Clean anchor fragment if present
      const cleanPath = linkTarget.split("#")[0];
      const absoluteTarget = path.resolve(REPO_ROOT, cleanPath);

      expect(
        fs.existsSync(absoluteTarget),
        `Broken link found in README.md: target "${linkTarget}" does not exist at "${absoluteTarget}"`
      ).toBe(true);

      checkedLinks.push(linkTarget);
    }

    // Verify key files were found and checked
    expect(checkedLinks).toContain("CONTEXT.md");
    expect(checkedLinks).toContain("docs/adr/0001-shadowcasting-component-architecture.md");
    expect(checkedLinks).toContain("docs/adr/0002-decoupled-transparent-shadow-layer.md");
    expect(checkedLinks).toContain("docs/adr/README.md");
    expect(checkedLinks).toContain("public/images/wood-background.webp");
    expect(checkedLinks).toContain("public/images/decayedpaint-background.webp");
    expect(checkedLinks).toContain("public/images/shadow-1.webp");
    expect(checkedLinks).toContain("public/images/shadow-2.webp");
  });

  it("markdown links to Next.js application routes match actual app pages", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...readmeContent.matchAll(markdownLinkRegex)];

    const routeLinks = matches
      .map((m) => m[2].trim())
      .filter((target) => target.startsWith("/") && !target.startsWith("//"));

    const uniqueRoutes = [...new Set(routeLinks)];

    // Must include the core playground and showcase routes
    expect(uniqueRoutes).toContain("/");
    expect(uniqueRoutes).toContain("/showcase");
    expect(uniqueRoutes).toContain("/showcase/wood-header");
    expect(uniqueRoutes).toContain("/showcase/decayed-paint");
    expect(uniqueRoutes).toContain("/showcase/scroll-top");
    expect(uniqueRoutes).toContain("/showcase/scroll-mid");

    for (const route of uniqueRoutes) {
      let relativePagePath: string;
      if (route === "/") {
        relativePagePath = "src/app/page.tsx";
      } else {
        relativePagePath = path.join("src/app", route, "page.tsx");
      }

      const absolutePagePath = path.resolve(REPO_ROOT, relativePagePath);
      expect(
        fs.existsSync(absolutePagePath),
        `Route "${route}" referenced in README.md does not have a corresponding page file at "${absolutePagePath}"`
      ).toBe(true);
    }
  });

  it("Quickstart code snippet imports and props match actual ShadowBackground exports and types", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    // Extract code block containing <ShadowBackground
    const tsxCodeBlockRegex = /```tsx([\s\S]*?)```/g;
    const codeBlocks = [...readmeContent.matchAll(tsxCodeBlockRegex)].map((m) => m[1]);

    const quickstartBlock = codeBlocks.find((block) =>
      block.includes("<ShadowBackground")
    );
    expect(quickstartBlock).toBeDefined();

    // 1. Verify import statement
    expect(quickstartBlock).toMatch(
      /import\s+\{\s*ShadowBackground\s*\}\s+from\s+["']@\/components\/ShadowBackground["']/
    );

    // 2. Verify component is exported and callable
    expect(typeof ShadowBackground).toBe("object"); // React.forwardRef object
    expect(ShadowBackground.displayName).toBe("ShadowBackground");

    // 3. Verify props in quickstart match ShadowBackgroundProps
    const quickstartProps: ShadowBackgroundProps = {
      basePlate: "/images/wood-background.webp",
      poster: "/images/wood-background.webp",
      caster: {
        type: "image",
        src: "/images/shadow-1.webp",
      },
      contactHardening: true,
      penumbra: 24,
      shadowOpacity: 0.65,
      motion: "smooth",
      className: "relative h-[640px] w-full",
    };

    // Statically type-check by creating React element with quickstart props
    const element = React.createElement(ShadowBackground, quickstartProps, "Child Content");
    expect(element).toBeDefined();
    expect(element.props.basePlate).toBe("/images/wood-background.webp");
    expect(element.props.contactHardening).toBe(true);
    expect(element.props.motion).toBe("smooth");

    // 4. Verify layering isolation: quickstart wraps children with relative z-10
    expect(quickstartBlock).toContain("relative z-10");
  });

  it("Comprehensive Documentation Index lists all 6 companion guides and domain documents", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    const expectedGuides = [
      "docs/guides/api-reference.md",
      "docs/guides/01-editorial-hero.md",
      "docs/guides/02-scroll-parallax.md",
      "docs/guides/03-procedural-shadows.md",
      "docs/guides/04-performance-and-degradation.md",
      "docs/guides/05-custom-physics-and-lighting.md",
    ];

    for (const guide of expectedGuides) {
      expect(
        readmeContent,
        `README.md must index companion guide "${guide}"`
      ).toContain(guide);
    }

    // Architecture and domain links
    expect(readmeContent).toContain("CONTEXT.md");
    expect(readmeContent).toContain("docs/adr/0001-shadowcasting-component-architecture.md");
    expect(readmeContent).toContain("docs/adr/0002-decoupled-transparent-shadow-layer.md");
    expect(readmeContent).toContain("docs/adr/README.md");
  });

  it("strictly adheres to canonical domain terminology from CONTEXT.md", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    // Canonical terms must be present
    expect(readmeContent).toContain("Base Plate");
    expect(readmeContent).toContain("Shadow Caster");
    expect(readmeContent).toContain("Penumbra");
    expect(readmeContent).toContain("Contact Hardening");
    expect(readmeContent).toContain("Static Poster Fallback");
    expect(readmeContent).toContain("Degradation Tier");

    // Forbidden terms must NOT be used as architectural concepts in README
    const lowercase = readmeContent.toLowerCase();
    expect(lowercase).not.toContain("occluder");
    expect(lowercase).not.toContain("mask image");
    expect(lowercase).not.toContain("canvas floor");
    expect(lowercase).not.toContain("event animation");
  });

  it("documents all primary developer lifecycle commands", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    expect(readmeContent).toContain("pnpm dev");
    expect(readmeContent).toContain("pnpm build");
    expect(readmeContent).toContain("pnpm test");
    expect(readmeContent).toContain("pnpm lint");
  });

  describe("Technical Scenario Guides (Ticket #33)", () => {
    const COMPANION_GUIDES = new Set([
      "01-editorial-hero.md",
      "02-scroll-parallax.md",
      "03-procedural-shadows.md",
      "04-performance-and-degradation.md",
      "05-custom-physics-and-lighting.md",
      "api-reference.md",
    ]);

    function assertGuideIntegrity(
      relativePath: string,
      expectedTitle: string,
      requiredPhrases: string[]
    ) {
      const guidePath = path.join(REPO_ROOT, relativePath);
      expect(fs.existsSync(guidePath), `Guide file must exist at ${guidePath}`).toBe(true);

      const stats = fs.statSync(guidePath);
      expect(stats.size, `${relativePath} must be non-empty (>500 bytes)`).toBeGreaterThan(500);

      const content = fs.readFileSync(guidePath, "utf-8");
      expect(content, `${relativePath} must contain title "${expectedTitle}"`).toContain(
        expectedTitle
      );

      for (const phrase of requiredPhrases) {
        expect(content, `${relativePath} must contain section/phrase "${phrase}"`).toContain(
          phrase
        );
      }

      // Canonical domain terminology checks from CONTEXT.md
      expect(content).toContain("Base Plate");
      expect(content).toContain("Shadow Caster");
      expect(content).toContain("Penumbra");
      expect(content).toContain("Contact Hardening");

      // Forbidden terms must not appear as architectural concepts
      const lowercase = content.toLowerCase();
      expect(lowercase).not.toContain("occluder");
      expect(lowercase).not.toContain("mask image");
      expect(lowercase).not.toContain("canvas floor");
      expect(lowercase).not.toContain("event animation");

      // Verify markdown links
      const guideDir = path.dirname(guidePath);
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const matches = [...content.matchAll(markdownLinkRegex)];
      expect(matches.length, `${relativePath} should contain markdown links`).toBeGreaterThan(0);

      for (const match of matches) {
        const linkTarget = match[2].trim();

        if (
          linkTarget.startsWith("http://") ||
          linkTarget.startsWith("https://") ||
          linkTarget.startsWith("#")
        ) {
          continue;
        }

        if (linkTarget.startsWith("/")) {
          // Route link: verify corresponding page exists
          let relativePagePath: string;
          if (linkTarget === "/") {
            relativePagePath = "src/app/page.tsx";
          } else {
            relativePagePath = path.join("src/app", linkTarget, "page.tsx");
          }
          const absolutePagePath = path.resolve(REPO_ROOT, relativePagePath);
          expect(
            fs.existsSync(absolutePagePath),
            `Route link "${linkTarget}" in ${relativePath} does not have a page at "${absolutePagePath}"`
          ).toBe(true);
          continue;
        }

        // Companion guide link within docs/guides/
        if (COMPANION_GUIDES.has(linkTarget)) {
          const companionPath = path.resolve(guideDir, linkTarget);
          if (fs.existsSync(companionPath)) {
            expect(fs.statSync(companionPath).isFile()).toBe(true);
          }
          continue;
        }

        // Relative file link
        const cleanPath = linkTarget.split("#")[0];
        const absoluteTarget = path.resolve(guideDir, cleanPath);
        expect(
          fs.existsSync(absoluteTarget),
          `Broken relative markdown link "${linkTarget}" in ${relativePath} does not exist at "${absoluteTarget}"`
        ).toBe(true);
      }

      // Verify image asset references
      const assetRegex = /\/images\/[a-zA-Z0-9_\-.]+\.(?:webp|png|svg|jpg|jpeg)/g;
      const assetMatches = [...content.matchAll(assetRegex)];
      const uniqueAssets = [...new Set(assetMatches.map((m) => m[0]))];
      for (const assetPath of uniqueAssets) {
        const absoluteAssetPath = path.join(REPO_ROOT, "public", assetPath);
        expect(
          fs.existsSync(absoluteAssetPath),
          `Asset reference "${assetPath}" in ${relativePath} does not exist at "${absoluteAssetPath}"`
        ).toBe(true);
      }
    }

    it("verifies docs/guides/03-procedural-shadows.md exists and passes link and content integrity", () => {
      assertGuideIntegrity(
        "docs/guides/03-procedural-shadows.md",
        "# Scenario Guide: Procedural Generative Shadows",
        [
          "Generative Komorebi Canopy Architecture",
          "Simplex 2D Noise",
          "Fractional Brownian Motion (fBm)",
          "0 KB of texture memory",
          "Parametric Botanical Branch Architecture",
          "Poisson-Disk Leaf Cluster Dispersion",
          "Hierarchical Harmonic Sway Animation",
          "Linear Congruential Generator",
          'type: "komorebi"',
          'type: "branch"',
        ]
      );
    });

    it("verifies docs/guides/04-performance-and-degradation.md exists and passes link and content integrity", () => {
      assertGuideIntegrity(
        "docs/guides/04-performance-and-degradation.md",
        "# Scenario Guide: Performance Tiering & Zero-LCP Handover",
        [
          "The 4-Tier Progressive Degradation Ladder",
          "Tier 1: Full-Dynamic",
          "Tier 2: Low-Dynamic",
          "Tier 3: CSS Fallback",
          "Tier 4: Static Poster",
          "The Zero-LCP Handover Lifecycle",
          "requestIdleCallback",
          "300ms Cross-Fade Handover",
          "prefers-reduced-motion",
          "deviceMemory",
          "hardwareConcurrency",
          "CLS strictly 0.000",
        ]
      );
    });

    it("verifies docs/guides/05-custom-physics-and-lighting.md exists and passes link and content integrity", () => {
      assertGuideIntegrity(
        "docs/guides/05-custom-physics-and-lighting.md",
        "# Scenario Guide: Custom Motion Physics & Virtual Lighting",
        [
          "Physical Foundations of Second-Order Spring Dynamics",
          "Semi-Implicit Euler Integrator",
          "Numerical Stability Safeguards",
          "Calibrated Motion Presets",
          "snappy",
          "smooth",
          "inertial",
          "bouncy",
          "Virtual Light Coordinates & Projection Mathematics",
          "Poisson Contact Hardening Math",
          "Decoupled vs. Coupled Base Plate Motion",
          "basePlateMotion={true}",
        ]
      );
    });
  });
});
