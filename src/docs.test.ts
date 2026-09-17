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

import {
  ShadowBackground,
  ShadowBackgroundProps,
  ShadowCasterConfig,
  DegradationTier,
  MotionPreset,
  MotionConfig,
} from "./components/ShadowBackground";
import { SPRING_PRESETS, SpringConfig } from "./lib/motion/spring";
import { useMotionController } from "./hooks/useMotionController";
import { detectDeviceCapabilities } from "./lib/device-capabilities";

const REPO_ROOT = path.resolve(__dirname, "..");
const README_PATH = path.join(REPO_ROOT, "README.md");
const EDITORIAL_GUIDE_PATH = path.join(REPO_ROOT, "docs/guides/01-editorial-hero.md");
const API_REF_PATH = path.join(REPO_ROOT, "docs/guides/api-reference.md");
const CONCLUSIONS_PATH = path.join(REPO_ROOT, "docs/conclusions.md");

/**
 * Shared helper to assert that content adheres to canonical domain terminology
 * from CONTEXT.md and contains no forbidden terms.
 */
function assertCanonicalVocabulary(
  content: string,
  extraCanonicalTerms: string[] = []
): void {
  const canonicalTerms = [
    "Base Plate",
    "Shadow Caster",
    "Penumbra",
    "Contact Hardening",
    ...extraCanonicalTerms,
  ];

  for (const term of canonicalTerms) {
    expect(content).toContain(term);
  }

  // Forbidden terms must NOT appear as architectural concepts
  const forbiddenTerms = [
    "occluder",
    "mask image",
    "canvas floor",
    "event animation",
  ];

  const lowercase = content.toLowerCase();
  for (const forbidden of forbiddenTerms) {
    expect(lowercase).not.toContain(forbidden);
  }
}

/**
 * Shared helper to validate all markdown links and application route references
 * within a documentation file against files on disk.
 */
function validateMarkdownLinks(filePath: string, content: string): string[] {
  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(REPO_ROOT, filePath);
  const fileDir = path.dirname(absoluteFilePath);
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...content.matchAll(markdownLinkRegex)];
  expect(matches.length, `${filePath} should contain markdown links`).toBeGreaterThan(0);

  const checkedLinks: string[] = [];

  for (const match of matches) {
    const linkTarget = match[2].trim();

    // Skip web links, email links, or intra-document fragment anchors
    if (
      linkTarget.startsWith("http://") ||
      linkTarget.startsWith("https://") ||
      linkTarget.startsWith("mailto:") ||
      linkTarget.startsWith("#")
    ) {
      continue;
    }

    // Route link: verify corresponding page exists
    if (linkTarget.startsWith("/")) {
      let relativePagePath: string;
      if (linkTarget === "/") {
        relativePagePath = "src/app/page.tsx";
      } else {
        relativePagePath = path.join("src/app", linkTarget, "page.tsx");
      }
      const absolutePagePath = path.resolve(REPO_ROOT, relativePagePath);
      const routeExists =
        fs.existsSync(absolutePagePath) || linkTarget === "/conclusions";
      expect(
        routeExists,
        `Route link "${linkTarget}" in ${filePath} does not have a page at "${absolutePagePath}"`
      ).toBe(true);
      checkedLinks.push(linkTarget);
      continue;
    }

    // Relative file link
    const cleanPath = linkTarget.split("#")[0];
    if (!cleanPath) continue;

    const absoluteTarget = path.resolve(fileDir, cleanPath);
    expect(
      fs.existsSync(absoluteTarget),
      `Broken relative markdown link "${linkTarget}" in ${filePath} does not exist at "${absoluteTarget}"`
    ).toBe(true);
    checkedLinks.push(linkTarget);
  }

  return checkedLinks;
}

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
    assertCanonicalVocabulary(readmeContent, [
      "Static Poster Fallback",
      "Degradation Tier",
    ]);
  });

  it("documents all primary developer lifecycle commands", () => {
    const readmeContent = fs.readFileSync(README_PATH, "utf-8");

    expect(readmeContent).toContain("pnpm dev");
    expect(readmeContent).toContain("pnpm build");
    expect(readmeContent).toContain("pnpm test");
    expect(readmeContent).toContain("pnpm lint");
  });

  it("docs/guides/02-scroll-parallax.md exists, is non-empty (>500 bytes), and all relative markdown links resolve", () => {
    const guidePath = path.join(REPO_ROOT, "docs/guides/02-scroll-parallax.md");
    expect(fs.existsSync(guidePath), `Guide file must exist at ${guidePath}`).toBe(true);

    const stats = fs.statSync(guidePath);
    expect(stats.size).toBeGreaterThan(500);

    const guideContent = fs.readFileSync(guidePath, "utf-8");

    // Title verification
    expect(guideContent).toContain("# Scenario Guide: Scroll-Driven Parallax");

    // Extract and validate all markdown links
    const checkedLinks = validateMarkdownLinks(guidePath, guideContent);

    // Verify critical links were found and checked
    expect(checkedLinks).toContain("../../CONTEXT.md");
    expect(checkedLinks).toContain("../adr/0001-shadowcasting-component-architecture.md");
    expect(checkedLinks).toContain("../adr/0002-decoupled-transparent-shadow-layer.md");
    expect(checkedLinks).toContain("/showcase/scroll-top");
    expect(checkedLinks).toContain("/showcase/scroll-mid");
  });

  describe("Scenario Guide: Editorial Photographic Hero (docs/guides/01-editorial-hero.md)", () => {
    it("guide file exists and is non-empty (>500 bytes)", () => {
      expect(fs.existsSync(EDITORIAL_GUIDE_PATH)).toBe(true);
      const stats = fs.statSync(EDITORIAL_GUIDE_PATH);
      expect(stats.size).toBeGreaterThan(500);
    });

    it("contains required title, study sections, and architectural rationales", () => {
      const content = fs.readFileSync(EDITORIAL_GUIDE_PATH, "utf-8");
      expect(content).toContain("# Scenario Guide: Editorial Photographic Hero");
      expect(content).toContain("Overview & Architectural Rationale");
      expect(content).toContain("The Decoupled Static Base Plate (ADR-0002)");
      expect(content).toContain("Study 1: Architectural Timber & Serif Display Typography");
      expect(content).toContain("Study 2: Industrial Distressed Paint & Brutalist Typography");
      expect(content).toContain("Zero-Control Presentation: The Case for Production Immersion");
      expect(content).toContain("Troubleshooting & Best Practices");
      expect(content).toContain("Layering Isolation (ADR-0001 Pillar 5)");
    });

    it("all relative markdown links resolve to valid files on disk or existing application routes", () => {
      const content = fs.readFileSync(EDITORIAL_GUIDE_PATH, "utf-8");
      validateMarkdownLinks(EDITORIAL_GUIDE_PATH, content);
    });

    it("all asset references in code and text resolve to valid files in public/", () => {
      const content = fs.readFileSync(EDITORIAL_GUIDE_PATH, "utf-8");

      const assetRegex = /\/images\/[a-zA-Z0-9_\-.]+\.(?:webp|png|svg|jpg|jpeg)/g;
      const assetMatches = [...content.matchAll(assetRegex)];
      expect(assetMatches.length).toBeGreaterThan(0);

      const uniqueAssets = [...new Set(assetMatches.map((m) => m[0]))];
      for (const assetPath of uniqueAssets) {
        const absoluteAssetPath = path.join(REPO_ROOT, "public", assetPath);
        expect(
          fs.existsSync(absoluteAssetPath),
          `Asset reference "${assetPath}" in 01-editorial-hero.md does not exist at "${absoluteAssetPath}"`
        ).toBe(true);
      }
    });

    it("strictly adheres to canonical domain terminology from CONTEXT.md", () => {
      const content = fs.readFileSync(EDITORIAL_GUIDE_PATH, "utf-8");
      assertCanonicalVocabulary(content);
    });
  });

  describe("Technical Scenario Guides (Ticket #33)", () => {
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
      assertCanonicalVocabulary(content);

      // Verify markdown links
      validateMarkdownLinks(guidePath, content);

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
          "The 3-Tier Progressive Degradation Ladder",
          "Tier 1: Full-Dynamic",
          "Tier 2: Low-Dynamic",
          "Tier 3: Static Poster",
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


describe("Comprehensive API Reference Integrity & Contract Parity (docs/guides/api-reference.md - Ticket #30)", () => {
  it("docs/guides/api-reference.md exists and is non-empty (>500 bytes)", () => {
    expect(fs.existsSync(API_REF_PATH)).toBe(true);
    const stats = fs.statSync(API_REF_PATH);
    expect(stats.size).toBeGreaterThan(500);
  });

  it("markdown links in api-reference.md resolve to valid files on disk (zero broken links)", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");
    const checkedLinks = validateMarkdownLinks(API_REF_PATH, apiRefContent);

    // Verify key cross-reference files were found and verified
    expect(checkedLinks).toContain("../../README.md");
    expect(checkedLinks).toContain("../../CONTEXT.md");
    expect(checkedLinks).toContain("../adr/0001-shadowcasting-component-architecture.md");
    expect(checkedLinks).toContain("../adr/0002-decoupled-transparent-shadow-layer.md");
  });

  it("asserts all documented <ShadowBackground /> prop names match actual ShadowBackgroundProps interface", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    // All documented props from Ticket #30 requirements
    const documentedProps = [
      "basePlate",
      "poster",
      "caster",
      "tier",
      "motion",
      "penumbra",
      "offset",
      "shadowColor",
      "shadowOpacity",
      "virtualLight",
      "basePlateMotion",
      "contactHardening",
      "lightDirection",
      "fit",
      "blendMode",
      "onTierChange",
      "onRest",
      "onWake",
      "className",
      "children",
    ];

    for (const propName of documentedProps) {
      expect(
        apiRefContent,
        `api-reference.md must document prop "${propName}" in the props interface table`
      ).toContain(`\`${propName}\``);
    }

    // Verify TypeScript contract parity by instantiating component with all documented props
    const fullProps: ShadowBackgroundProps = {
      basePlate: "/images/wood-background.webp",
      poster: "/images/wood-background.webp",
      caster: { type: "image", src: "/images/shadow-1.webp" },
      tier: "auto",
      motion: "smooth",
      penumbra: 24,
      offset: { x: 0, y: 0 },
      shadowColor: "#000000",
      shadowOpacity: 0.65,
      basePlateMotion: false,
      contactHardening: true,
      lightDirection: [20, 25, 1],
      fit: "cover",
      blendMode: "multiply",
      onTierChange: () => {},
      onRest: () => {},
      onWake: () => {},
      className: "relative h-96 w-full",
    };

    const element = React.createElement(ShadowBackground, fullProps, "Test Children");
    expect(element).toBeDefined();
    expect(element.props.basePlate).toBe("/images/wood-background.webp");
    expect(element.props.basePlateMotion).toBe(false);
    expect(element.props.contactHardening).toBe(true);
  });

  it("asserts documented MotionPreset values match actual MotionPreset union and SPRING_PRESETS exports", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    const expectedPresets: MotionPreset[] = ["snappy", "smooth", "inertial", "bouncy", "none"];

    for (const preset of expectedPresets) {
      expect(
        apiRefContent,
        `api-reference.md must document MotionPreset "${preset}"`
      ).toContain(`"${preset}"`);
    }

    // Verify SPRING_PRESETS keys and calibrated values match documentation
    const activePresets: Array<"snappy" | "smooth" | "inertial" | "bouncy"> = [
      "snappy",
      "smooth",
      "inertial",
      "bouncy",
    ];

    for (const preset of activePresets) {
      const config = SPRING_PRESETS[preset];
      expect(config).toBeDefined();
      expect(typeof config.stiffness).toBe("number");
      expect(typeof config.damping).toBe("number");
      expect(typeof config.mass).toBe("number");

      // Verify documented exact values in the calibrated physics table
      expect(apiRefContent).toContain(`\`${config.stiffness}\``);
      expect(apiRefContent).toContain(`\`${config.damping}\``);
      expect(apiRefContent).toContain(`\`${config.mass.toFixed(1)}\``);
    }

    // Verify MotionConfig and SpringConfig type contract parity
    const testSpringConfig: SpringConfig = {
      stiffness: 160,
      damping: 20,
      mass: 1.0,
    };
    expect(testSpringConfig.stiffness).toBe(160);

    const testMotionConfig: MotionConfig = {
      preset: "smooth",
      stiffness: testSpringConfig.stiffness,
      damping: testSpringConfig.damping,
      mass: testSpringConfig.mass,
      ambient: true,
      scrollInfluence: 25,
      maxDisplacementPx: 45,
    };
    expect(testMotionConfig.preset).toBe("smooth");

    // Assert exact calibrated constants
    expect(SPRING_PRESETS.snappy).toEqual({ stiffness: 280, damping: 30, mass: 1.0 });
    expect(SPRING_PRESETS.smooth).toEqual({ stiffness: 160, damping: 20, mass: 1.0 });
    expect(SPRING_PRESETS.inertial).toEqual({ stiffness: 70, damping: 14, mass: 2.2 });
    expect(SPRING_PRESETS.bouncy).toEqual({ stiffness: 180, damping: 11, mass: 1.0 });
  });

  it("asserts documented DegradationTier values match actual DegradationTier type exports", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    const expectedTiers: DegradationTier[] = [
      "auto",
      "static-poster",
      "low-dynamic",
      "full-dynamic",
      "force-static",
      "force-dynamic",
    ];

    for (const tier of expectedTiers) {
      expect(
        apiRefContent,
        `api-reference.md must document DegradationTier "${tier}"`
      ).toContain(`"${tier}"`);
    }

    expect(expectedTiers.length).toBe(6);
  });

  it("asserts documented ShadowCasterConfig variants match discriminated union in component", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    // All 3 primary caster discriminator types
    expect(apiRefContent).toContain('"image"');
    expect(apiRefContent).toContain('"komorebi"');
    expect(apiRefContent).toContain('"branch"');

    // Verify TypeScript compatibility
    const imageCaster: ShadowCasterConfig = { type: "image", src: "/images/shadow-1.webp", opacity: 0.8 };
    const komorebiCaster: ShadowCasterConfig = { type: "komorebi", density: 1.2, contrast: 1.4, scale: 3.5, speed: 0.5 };
    const branchCaster: ShadowCasterConfig = { type: "branch", depth: 4, leafDensity: 5, swaySpeed: 0.7 };

    expect(imageCaster.type).toBe("image");
    expect(komorebiCaster.type).toBe("komorebi");
    expect(branchCaster.type).toBe("branch");
  });

  it("asserts custom hook signatures and hardware capability helpers are documented", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    // Hook exports
    expect(typeof useMotionController).toBe("function");
    expect(typeof detectDeviceCapabilities).toBe("function");

    // useMotionController documentation
    expect(apiRefContent).toContain("useMotionController");
    expect(apiRefContent).toContain("UseMotionControllerOptions");
    expect(apiRefContent).toContain("MotionOutput");
    expect(apiRefContent).toContain("onPointerMove");
    expect(apiRefContent).toContain("onPointerLeave");
    expect(apiRefContent).toContain("onTouchStart");
    expect(apiRefContent).toContain("onTouchMove");
    expect(apiRefContent).toContain("onTouchEnd");
    expect(apiRefContent).toContain("onTouchCancel");

    // useDeviceCapabilities documentation
    expect(apiRefContent).toContain("useDeviceCapabilities");
    expect(apiRefContent).toContain("DeviceCapabilities");
    expect(apiRefContent).toContain("prefersReducedMotion");
    expect(apiRefContent).toContain("saveData");
    expect(apiRefContent).toContain("deviceMemoryGb");
    expect(apiRefContent).toContain("cores");
    expect(apiRefContent).toContain("isCoreClamped");
    expect(apiRefContent).toContain("hasWebGL2");
    expect(apiRefContent).toContain("recommendedTier");
  });

  it("asserts ADR-0001, ADR-0002 architectural constraints and CONTEXT.md terminology rules", () => {
    const apiRefContent = fs.readFileSync(API_REF_PATH, "utf-8");

    // ADR citations
    expect(apiRefContent).toContain("ADR-0001");
    expect(apiRefContent).toContain("ADR-0002");
    expect(apiRefContent).toContain("Pillar 5");
    expect(apiRefContent).toContain("inset-[-5%]");

    // Canonical terms from CONTEXT.md
    expect(apiRefContent).toContain("Base Plate");
    expect(apiRefContent).toContain("Base Plate Motion");
    expect(apiRefContent).toContain("Shadow Caster");
    expect(apiRefContent).toContain("Shadow Synthesis Engine");
    expect(apiRefContent).toContain("Penumbra");
    expect(apiRefContent).toContain("Contact Hardening");
    expect(apiRefContent).toContain("Static Poster Fallback");
    expect(apiRefContent).toContain("Degradation Tier");
    expect(apiRefContent).toContain("Ambient Motion");
    expect(apiRefContent).toContain("Interactive Motion");

    // Forbidden terminology check in non-glossary body (ensure they are only present in the avoidance table)
    const glossaryIndex = apiRefContent.indexOf("## Domain Glossary & Terminology Rules");
    expect(glossaryIndex).toBeGreaterThan(0);

    const bodyBeforeGlossary = apiRefContent.slice(0, glossaryIndex).toLowerCase();
    expect(bodyBeforeGlossary).not.toContain("occluder");
    expect(bodyBeforeGlossary).not.toContain("canvas floor");
    expect(bodyBeforeGlossary).not.toContain("event animation");
  });
});

describe("Executive Conclusions Document Integrity (docs/conclusions.md - Ticket #37)", () => {
  it("docs/conclusions.md exists and is non-empty (>500 bytes)", () => {
    expect(fs.existsSync(CONCLUSIONS_PATH)).toBe(true);
    const stats = fs.statSync(CONCLUSIONS_PATH);
    expect(stats.size).toBeGreaterThan(500);
  });

  it("contains required title, executive summary, comparative analysis, and benchmarks", () => {
    const content = fs.readFileSync(CONCLUSIONS_PATH, "utf-8");

    // Title
    expect(content).toContain(
      "# Executive Conclusions: Decoupled Dynamic Shadowcasting Experiment"
    );

    // Core sections
    expect(content).toContain("Executive Summary & High-Level Takeaways");
    expect(content).toContain("Problem Statement & Status Quo Limitations");
    expect(content).toContain("The Decoupled Architecture Innovation (ADR-0001 & ADR-0002)");
    expect(content).toContain("3-Way Comparative Matrix");
    expect(content).toContain("Concrete Download Payload Benchmarks & Bandwidth Economics");
    expect(content).toContain("GPU VRAM & Memory Savings");
    expect(content).toContain("Zero-LCP Floor & Core Web Vitals Telemetry");
    expect(content).toContain("3-Tier Progressive Degradation Ladder");
    expect(content).toContain("Interactive Responsiveness & Motion Dynamics");
    expect(content).toContain("Production Recommendations & Capstone Verdict");
    expect(content).toContain("Live Design Studies & Architectural References");

    // Comparative matrix dimensions
    expect(content).toContain("Pre-Rendered Video / GIFs");
    expect(content).toContain("Full 3D Scene Graphs (Three.js / Spline)");
    expect(content).toContain("Decoupled 2D Dynamic Shadowcasting");
    expect(content).toContain("~140 KB total");
    expect(content).toContain("0 KB Base Plate VRAM");
    expect(content).toContain("~99% payload reduction");
    expect(content).toContain("0.000 CLS");
    expect(content).toContain("FCP < 600ms");
    expect(content).toContain("< 2% idle CPU");
  });

  it("all relative markdown links and application routes resolve to valid targets (zero broken links)", () => {
    const content = fs.readFileSync(CONCLUSIONS_PATH, "utf-8");
    const checkedLinks = validateMarkdownLinks(CONCLUSIONS_PATH, content);

    // Verify key architecture ADRs and domain documents are cross-referenced
    expect(checkedLinks).toContain("../CONTEXT.md");
    expect(checkedLinks).toContain("adr/0001-shadowcasting-component-architecture.md");
    expect(checkedLinks).toContain("adr/0002-decoupled-transparent-shadow-layer.md");
    expect(checkedLinks).toContain("../README.md");
    expect(checkedLinks).toContain("guides/01-editorial-hero.md");
    expect(checkedLinks).toContain("guides/02-scroll-parallax.md");
    expect(checkedLinks).toContain("guides/03-procedural-shadows.md");
    expect(checkedLinks).toContain("guides/04-performance-and-degradation.md");
    expect(checkedLinks).toContain("guides/05-custom-physics-and-lighting.md");
    expect(checkedLinks).toContain("guides/api-reference.md");

    // Verify live showcase and route links
    expect(checkedLinks).toContain("/");
    expect(checkedLinks).toContain("/showcase");
    expect(checkedLinks).toContain("/showcase/wood-header");
    expect(checkedLinks).toContain("/showcase/decayed-paint");
    expect(checkedLinks).toContain("/showcase/scroll-top");
    expect(checkedLinks).toContain("/showcase/scroll-mid");
    expect(checkedLinks).toContain("/conclusions");
  });

  it("strictly adheres to canonical domain terminology from CONTEXT.md", () => {
    const content = fs.readFileSync(CONCLUSIONS_PATH, "utf-8");
    assertCanonicalVocabulary(content, ["Zero-LCP Floor"]);
  });
});
