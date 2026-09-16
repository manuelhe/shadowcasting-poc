import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

import { DiagnosticHUD, HarnessSettings } from "./DiagnosticHUD";
import {
  getCachedDeviceCapabilities,
  clearDeviceCapabilitiesCache,
} from "@/lib/device-capabilities";

describe("DiagnosticHUD", () => {
  let window: GlobalWindow;
  let rootContainer: HTMLElement;

  beforeEach(() => {
    clearDeviceCapabilitiesCache();
    window = new GlobalWindow();
    Object.defineProperty(global, "window", { value: window, configurable: true, writable: true });
    Object.defineProperty(global, "document", { value: window.document, configurable: true, writable: true });
    Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true, writable: true });
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
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    rootContainer = div as unknown as HTMLElement;
  });

  afterEach(() => {
    window.close();
    clearDeviceCapabilitiesCache();
  });

  it("ensures getCachedDeviceCapabilities returns a referentially stable reference", () => {
    const first = getCachedDeviceCapabilities();
    const second = getCachedDeviceCapabilities();
    expect(first).toBe(second);
  });

  it("renders without triggering useSyncExternalStore infinite loop error", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const root = createRoot(rootContainer);
    await act(async () => {
      root.render(
        <DiagnosticHUD
          settings={{
            viewportMode: "cover",
            baseImage: "/images/base-architectural.svg",
            forcedTier: "auto",
            cpuStressMs: 0,
          }}
          onSettingsChange={() => {}}
        />
      );
    });

    const getSnapshotError = errorSpy.mock.calls.some((args) =>
      args.some((arg) => typeof arg === "string" && arg.includes("The result of getSnapshot should be cached"))
    );
    expect(getSnapshotError).toBe(false);
    expect(rootContainer.innerHTML).toContain("Diagnostics HUD");
  });

  it("re-renders with updated settings without throwing or exceeding update depth", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const root = createRoot(rootContainer);
    const initialSettings: HarnessSettings = {
      viewportMode: "cover",
      baseImage: "/images/base-architectural.svg",
      forcedTier: "auto",
      cpuStressMs: 0,
    };
    await act(async () => {
      root.render(
        <DiagnosticHUD
          settings={initialSettings}
          onSettingsChange={() => {}}
        />
      );
    });

    const updatedSettings: HarnessSettings = {
      viewportMode: "16:9",
      baseImage: "/images/base-architectural.svg",
      forcedTier: "static-poster",
      cpuStressMs: 10,
    };
    await act(async () => {
      root.render(
        <DiagnosticHUD
          settings={updatedSettings}
          onSettingsChange={() => {}}
        />
      );
    });

    const maxUpdateError = errorSpy.mock.calls.some((args) =>
      args.some((arg) => typeof arg === "string" && arg.includes("Maximum update depth exceeded"))
    );
    expect(maxUpdateError).toBe(false);
  });
});
