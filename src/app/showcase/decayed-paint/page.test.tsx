import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { currentPathname, shadowBgPropsSpy } = vi.hoisted(() => ({
  currentPathname: { value: "/showcase/decayed-paint" },
  shadowBgPropsSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname.value,
}));

// Mock ShadowBackground to intercept and assert on passed props while rendering container
vi.mock("@/components/ShadowBackground", () => {
  return {
    ShadowBackground: (props: Record<string, unknown>) => {
      shadowBgPropsSpy(props);
      return (
        <div
          data-testid="shadow-background-mock"
          data-base-plate={props.basePlate as string}
          data-caster={typeof props.caster === "string" ? props.caster : JSON.stringify(props.caster)}
          data-tier={props.tier as string}
          data-shadow-color={props.shadowColor as string}
          data-shadow-opacity={props.shadowOpacity as number}
          data-penumbra={props.penumbra as number}
          className={props.className as string}
        >
          {props.children as React.ReactNode}
        </div>
      );
    },
  };
});

vi.mock("@/components/ShowcaseNav", async () => {
  return await vi.importActual("../../../components/ShowcaseNav");
});
vi.mock("@/lib/device-capabilities", async () => {
  return await vi.importActual("../../../lib/device-capabilities");
});

import DecayedPaintShowcasePage from "./page";
import ShowcaseLayout from "../layout";
import { clearDeviceCapabilitiesCache } from "../../../lib/device-capabilities";

describe("Industrial Decayed Paint & Brutalist Typography Showcase (Issue #24)", () => {
  let window: GlobalWindow;
  let rootContainer: HTMLElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    clearDeviceCapabilitiesCache();
    shadowBgPropsSpy.mockClear();
    currentPathname.value = "/showcase/decayed-paint";

    window = new GlobalWindow({ url: "http://localhost:3000/showcase/decayed-paint" });
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

  describe("1. ShadowBackground Asset & Physics Configuration", () => {
    it("embeds <ShadowBackground /> with decayedpaint-background.webp and shadow-2.webp", async () => {
      await act(async () => {
        root?.render(<DecayedPaintShowcasePage />);
      });

      expect(shadowBgPropsSpy).toHaveBeenCalledTimes(1);
      const props = shadowBgPropsSpy.mock.calls[0][0];

      expect(props.basePlate).toBe("/images/decayedpaint-background.webp");
      expect(props.caster).toBe("/images/shadow-2.webp");
      expect(props.className).toContain("absolute inset-0");
      expect(props.tier).toBe("auto");
      expect(props.shadowColor).toBe("#080808");
      expect(props.shadowOpacity).toBe(0.85);
      expect(props.penumbra).toBe(24);
      expect(props.motion).toEqual({
        preset: "energetic",
        ambient: true,
        maxDisplacementPx: 45,
      });

      const shadowMock = rootContainer.querySelector('[data-testid="shadow-background-mock"]');
      expect(shadowMock).not.toBeNull();
      expect(shadowMock?.getAttribute("data-base-plate")).toBe("/images/decayedpaint-background.webp");
      expect(shadowMock?.getAttribute("data-caster")).toBe("/images/shadow-2.webp");
    });

    it("renders with a full-viewport container and dark neutral background", async () => {
      await act(async () => {
        root?.render(<DecayedPaintShowcasePage />);
      });

      const container = rootContainer.firstElementChild as HTMLElement;
      expect(container.className).toContain("min-h-screen");
      expect(container.className).toContain("relative");
      expect(container.className).toContain("flex items-center justify-center");
      expect(container.className).toContain("overflow-hidden");
      expect(container.className).toContain("bg-neutral-950");
    });
  });

  describe("2. Brutalist White Display Typography & Industrial Metadata", () => {
    it("renders bold brutalist display header 'PATINA & OCCLUSION'", async () => {
      await act(async () => {
        root?.render(<DecayedPaintShowcasePage />);
      });

      const header = rootContainer.querySelector('[data-testid="showcase-header"]');
      expect(header).not.toBeNull();
      expect(header?.textContent?.trim()).toBe("PATINA & OCCLUSION");
      expect(header?.className).toContain("font-black");
      expect(header?.className).toContain("uppercase");
      expect(header?.className).toContain("tracking-tighter");
      expect(header?.className).toContain("text-white");
      expect(header?.className).toContain("leading-none");
      expect(header?.className).toContain("text-6xl");
      expect(header?.className).toContain("md:text-8xl");
    });

    it("displays industrial metadata, study coordinates, and technical badges", async () => {
      await act(async () => {
        root?.render(<DecayedPaintShowcasePage />);
      });

      const text = rootContainer.textContent ?? "";
      expect(text).toContain("STUDY NO. 02 // INDUSTRIAL PATINA");
      expect(text).toContain("BASE: DISTRESSED LEAD");
      expect(text).toContain("CASTER: SHADOW-02");
      expect(text).toContain("PRESET: ENERGETIC");
      expect(text).toContain("0.85 ALPHA");
      expect(text).toContain("24PX GAUSSIAN");
      expect(text).toContain("±45PX SPRING DAMPED");
      expect(text).toContain("STRICTLY 0 (NONE)");
    });
  });

  describe("3. Strictly Zero Developer Controls", () => {
    it("renders zero sliders, range inputs, or diagnostic HUDs", async () => {
      await act(async () => {
        root?.render(<DecayedPaintShowcasePage />);
      });

      // No range sliders or input elements
      const inputs = rootContainer.querySelectorAll("input");
      expect(inputs.length).toBe(0);

      // No range sliders
      const rangeInputs = rootContainer.querySelectorAll('input[type="range"]');
      expect(rangeInputs.length).toBe(0);

      // No diagnostic HUD
      const hud = rootContainer.querySelector('[data-testid="diagnostic-hud"]');
      expect(hud).toBeNull();

      // No developer control buttons (e.g. tier switchers, toggle HUD, restart)
      const buttons = rootContainer.querySelectorAll("button");
      expect(buttons.length).toBe(0);

      // No role="slider" or role="tablist"
      const sliders = rootContainer.querySelectorAll('[role="slider"]');
      expect(sliders.length).toBe(0);
      const tabs = rootContainer.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBe(0);
    });
  });

  describe("4. Shell Navigation Integration", () => {
    it("renders within ShowcaseLayout with ShowcaseNav highlighting /showcase/decayed-paint as active", async () => {
      await act(async () => {
        root?.render(
          <ShowcaseLayout>
            <DecayedPaintShowcasePage />
          </ShowcaseLayout>
        );
      });

      const nav = rootContainer.querySelector('[data-testid="showcase-nav"]');
      expect(nav).not.toBeNull();

      const activeLink = nav?.querySelector('a[href="/showcase/decayed-paint"]');
      expect(activeLink).not.toBeNull();
      expect(activeLink?.getAttribute("data-active")).toBe("true");
      expect(activeLink?.getAttribute("aria-current")).toBe("page");

      // Other links should not be active
      const inactiveLink = nav?.querySelector('a[href="/showcase/wood-header"]');
      expect(inactiveLink?.getAttribute("data-active")).toBe("false");
      expect(inactiveLink?.getAttribute("aria-current")).toBeNull();
    });
  });
});
