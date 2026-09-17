import { GlobalWindow } from "happy-dom";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { clearDeviceCapabilitiesCache } from "../lib/device-capabilities";

export interface ShowcaseWindowEnvironment {
  window: GlobalWindow;
  rootContainer: HTMLElement;
  root: Root;
  cleanup: () => Promise<void>;
}

/**
 * Shared test utility to configure a happy-dom GlobalWindow environment with React act support,
 * animation frames, observers, and DOM container for showcase page tests.
 */
export function setupShowcaseWindow(
  url = "http://localhost:3000/showcase"
): ShowcaseWindowEnvironment {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  clearDeviceCapabilitiesCache();

  const window = new GlobalWindow({ url });
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

  const div = window.document.createElement("div");
  window.document.body.appendChild(div);
  const rootContainer = div as unknown as HTMLElement;
  const root = createRoot(rootContainer);

  const cleanup = async () => {
    await act(async () => {
      root.unmount();
    });
    window.close();
    clearDeviceCapabilitiesCache();
  };

  return { window, rootContainer, root, cleanup };
}
