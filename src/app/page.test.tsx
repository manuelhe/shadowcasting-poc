import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Path alias mocks matching repository conventions
vi.mock("@/components/ShadowBackground", async () => {
  return await vi.importActual("../components/ShadowBackground");
});
vi.mock("@/components/DiagnosticHUD", async () => {
  return await vi.importActual("../components/DiagnosticHUD");
});
vi.mock("@/components/PlaygroundCanvas", async () => {
  return await vi.importActual("../components/PlaygroundCanvas");
});
vi.mock("@/components/BenchmarkComparison", async () => {
  return await vi.importActual("../components/BenchmarkComparison");
});
vi.mock("@/components/ProceduralFoliageHarness", async () => {
  return await vi.importActual("../components/ProceduralFoliageHarness");
});
vi.mock("@/components/InteractiveMotionHarness", async () => {
  return await vi.importActual("../components/InteractiveMotionHarness");
});
vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("../lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("../lib/procedural/branch-skeleton");
});
vi.mock("@/lib/motion/motion-controller", async () => {
  return await vi.importActual("../lib/motion/motion-controller");
});
vi.mock("@/lib/motion/spring", async () => {
  return await vi.importActual("../lib/motion/spring");
});
vi.mock("@/hooks/useMotionController", async () => {
  return await vi.importActual("../hooks/useMotionController");
});
vi.mock("@/lib/fps-tracker", async () => {
  return await vi.importActual("../lib/fps-tracker");
});
vi.mock("@/lib/web-vitals", async () => {
  return await vi.importActual("../lib/web-vitals");
});
vi.mock("@/lib/device-capabilities", async () => {
  return await vi.importActual("../lib/device-capabilities");
});
vi.mock("@/lib/cpu-stress", async () => {
  return await vi.importActual("../lib/cpu-stress");
});

import Home from "./page";
import { clearDeviceCapabilitiesCache } from "@/lib/device-capabilities";

describe("Home Page - Hero Telemetry & Interactive Base Plate Motion Toggle (Issue #19)", () => {
  let window: GlobalWindow;
  let rootContainer: HTMLElement;

  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    clearDeviceCapabilitiesCache();
    window = new GlobalWindow({ url: "http://localhost:3000" });
    Object.defineProperty(global, "window", { value: window, configurable: true, writable: true });
    Object.defineProperty(global, "document", { value: window.document, configurable: true, writable: true });
    Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true, writable: true });
    Object.defineProperty(global, "self", { value: window, configurable: true, writable: true });

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

  it("renders telemetry pill showing 'Base Plate: Static (Decoupled)' by default", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-base-plate-telemetry"]');
    expect(telemetryPill).not.toBeNull();
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Base Plate: Static (Decoupled)");

    // Default container data attribute reflects stationary base plate
    const shadowContainer = rootContainer.querySelector('[data-base-plate-motion]');
    expect(shadowContainer).not.toBeNull();
    expect(shadowContainer?.getAttribute("data-base-plate-motion")).toBe("false");
  });

  it("references ADR-0001 & ADR-0002 in the hero header badge", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    expect(rootContainer.innerHTML).toContain("Production Architecture • ADR-0001 &amp; ADR-0002");
  });

  it("toggles basePlateMotion to true when 'Coupled Motion' is clicked and updates telemetry and DOM attributes", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-base-plate-telemetry"]');
    const shadowContainer = rootContainer.querySelector('[data-base-plate-motion]');
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Base Plate: Static (Decoupled)");
    expect(shadowContainer?.getAttribute("data-base-plate-motion")).toBe("false");

    // Locate "Coupled Motion" button
    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const coupledMotionButton = buttons.find((btn) => btn.textContent?.includes("Coupled Motion"));
    expect(coupledMotionButton).toBeDefined();

    // Click "Coupled Motion"
    await act(async () => {
      coupledMotionButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
    });

    // Verify telemetry updates to Dynamic (Coupled)
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Base Plate: Dynamic (Coupled)");
    // Verify <ShadowBackground> container updates to data-base-plate-motion="true"
    expect(shadowContainer?.getAttribute("data-base-plate-motion")).toBe("true");
  });

  it("toggles back to false when 'Static' is clicked after dynamic motion", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-base-plate-telemetry"]');
    const shadowContainer = rootContainer.querySelector('[data-base-plate-motion]');

    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const coupledMotionButton = buttons.find((btn) => btn.textContent?.includes("Coupled Motion"));
    const staticButton = buttons.find((btn) => btn.textContent?.includes("Static (Default)"));

    expect(coupledMotionButton).toBeDefined();
    expect(staticButton).toBeDefined();

    // Switch to Coupled Motion
    await act(async () => {
      coupledMotionButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
    });
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Base Plate: Dynamic (Coupled)");
    expect(shadowContainer?.getAttribute("data-base-plate-motion")).toBe("true");

    // Switch back to Static
    await act(async () => {
      staticButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
    });
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Base Plate: Static (Decoupled)");
    expect(shadowContainer?.getAttribute("data-base-plate-motion")).toBe("false");
  });

  it("renders the Showcase Gallery link in the header navigating to /showcase", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const links = Array.from(rootContainer.querySelectorAll("a"));
    const showcaseLink = links.find((link) => link.textContent?.includes("Showcase Gallery"));
    expect(showcaseLink).toBeDefined();
    expect(showcaseLink?.getAttribute("href")).toBe("/showcase");
  });

  it("renders the Executive Conclusions link in the header navigating to /conclusions", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const links = Array.from(rootContainer.querySelectorAll("a"));
    const conclusionsLink = links.find((link) => link.textContent?.includes("Conclusions"));
    expect(conclusionsLink).toBeDefined();
    expect(conclusionsLink?.getAttribute("href")).toBe("/conclusions");
  });

  it("renders the Guide and Presentation links in the header", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const links = Array.from(rootContainer.querySelectorAll("a"));
    const guideLink = links.find((link) => link.getAttribute("href") === "/guide");
    expect(guideLink).toBeDefined();
    expect(guideLink?.textContent?.includes("Guide")).toBe(true);

    const presentationLink = links.find((link) => link.getAttribute("href") === "/presentation");
    expect(presentationLink).toBeDefined();
    expect(presentationLink?.textContent?.includes("Presentation")).toBe(true);
  });

  it("renders Contact Point telemetry pill and default '0.1,0.1' data attribute", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-contact-point-telemetry"]');
    expect(telemetryPill).not.toBeNull();
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Contact Point: top-left");

    const shadowContainer = rootContainer.querySelector("[data-contact-point]");
    expect(shadowContainer).not.toBeNull();
    expect(shadowContainer?.getAttribute("data-contact-point")).toBe("0.1,0.1");
  });

  it("updates contactPoint and container attribute when preset button is clicked", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-contact-point-telemetry"]');
    const shadowContainer = rootContainer.querySelector("[data-contact-point]");
    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Contact Point: top-left");
    expect(shadowContainer?.getAttribute("data-contact-point")).toBe("0.1,0.1");

    // Click "bottom-center" preset button
    const buttons = Array.from(rootContainer.querySelectorAll("button"));
    const bottomCenterButton = buttons.find((btn) => btn.textContent?.trim() === "bottom-center");
    expect(bottomCenterButton).toBeDefined();

    await act(async () => {
      bottomCenterButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
    });

    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Contact Point: bottom-center");
    expect(shadowContainer?.getAttribute("data-contact-point")).toBe("0.5,1");
  });

  it("updates contactPoint and container attribute when select dropdown changes", async () => {
    await act(async () => {
      root?.render(<Home />);
    });

    const telemetryPill = rootContainer.querySelector('[data-testid="hero-contact-point-telemetry"]');
    const shadowContainer = rootContainer.querySelector("[data-contact-point]");
    const select = rootContainer.querySelector('select[data-testid="hero-contact-point-select"]') as HTMLSelectElement | null;
    expect(select).not.toBeNull();

    await act(async () => {
      if (select) {
        select.value = "center";
        select.dispatchEvent(new window.Event("change", { bubbles: true }) as unknown as Event);
      }
    });

    expect(telemetryPill?.textContent?.replace(/\s+/g, " ").trim()).toContain("Contact Point: center");
    expect(shadowContainer?.getAttribute("data-contact-point")).toBe("0.5,0.5");
  });
});

