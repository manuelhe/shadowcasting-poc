import { GlobalWindow } from "happy-dom";
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

describe("RootLayout Hydration", () => {
  let window: GlobalWindow;

  beforeEach(() => {
    window = new GlobalWindow();
    Object.defineProperty(global, "window", { value: window, configurable: true, writable: true });
    Object.defineProperty(global, "document", { value: window.document, configurable: true, writable: true });
    Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true, writable: true });
  });

  afterEach(() => {
    window.close();
  });

  it("suppresses hydration warnings when browser extensions inject attributes on html", async () => {
    const errorSpy = vi.spyOn(console, "error");

    const { hydrateRoot } = await import("react-dom/client");
    const { default: RootLayout } = await import("./layout");

    window.document.documentElement.setAttribute("lang", "en");
    window.document.documentElement.setAttribute("class", "--font-geist-sans --font-geist-mono h-full antialiased");
    // Simulate browser extension (e.g. LanguageTool) injecting attributes before React hydration
    window.document.documentElement.setAttribute("suppresshydrationwarning", "true");
    window.document.documentElement.setAttribute("data-lt-installed", "true");
    window.document.body.className = "min-h-full flex flex-col";
    window.document.body.innerHTML = "<main>App</main>";

    hydrateRoot(
      window.document as unknown as Document,
      <RootLayout>
        <main>App</main>
      </RootLayout>
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const hydrationMismatchCalls = errorSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes("hydration-mismatch") ||
            arg.includes("didn't match the client properties"))
      )
    );

    expect(hydrationMismatchCalls).toHaveLength(0);
  });

  it("suppresses hydration warnings when browser extensions inject attributes on body", async () => {
    const errorSpy = vi.spyOn(console, "error");

    const { hydrateRoot } = await import("react-dom/client");
    const { default: RootLayout } = await import("./layout");

    window.document.documentElement.setAttribute("lang", "en");
    window.document.documentElement.setAttribute("class", "--font-geist-sans --font-geist-mono h-full antialiased");
    window.document.body.className = "min-h-full flex flex-col";
    // Simulate browser extension (e.g. Grammarly) injecting attributes on body before React hydration
    window.document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1020.0");
    window.document.body.setAttribute("data-gr-ext-installed", "");
    window.document.body.innerHTML = "<main>App</main>";

    hydrateRoot(
      window.document as unknown as Document,
      <RootLayout>
        <main>App</main>
      </RootLayout>
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const hydrationMismatchCalls = errorSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes("hydration-mismatch") ||
            arg.includes("didn't match the client properties"))
      )
    );

    expect(hydrationMismatchCalls).toHaveLength(0);
  });
});
