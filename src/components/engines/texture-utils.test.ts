import { GlobalWindow } from "happy-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { uploadTextureImage } from "./texture-utils";

describe("uploadTextureImage WebGL Texture Upload Utility", () => {
  let mockWindow: GlobalWindow;

  beforeEach(() => {
    mockWindow = new GlobalWindow();
    Object.defineProperty(global, "window", {
      value: mockWindow,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: mockWindow.document,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    mockWindow.close();
  });

  it("rasterizes SVGs via an offscreen 2D canvas to prevent Blink GL_INVALID_VALUE error", () => {
    const gl = {
      TEXTURE_2D: 0x0de1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      texImage2D: vi.fn(),
      getError: vi.fn().mockReturnValue(0),
    } as unknown as WebGLRenderingContext;

    const drawImageSpy = vi.fn();
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: drawImageSpy,
      }),
    };

    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "canvas") return fakeCanvas as unknown as HTMLCanvasElement;
      return mockWindow.document.createElement(tag) as unknown as HTMLElement;
    }) as unknown as typeof document.createElement);

    const img = {
      src: "/images/caster-branch.svg",
      naturalWidth: 800,
      naturalHeight: 600,
      width: 800,
      height: 600,
    } as unknown as HTMLImageElement;

    uploadTextureImage(gl, img);

    // Should create offscreen canvas, draw SVG to it, and pass canvas to texImage2D
    expect(fakeCanvas.getContext).toHaveBeenCalledWith("2d");
    expect(drawImageSpy).toHaveBeenCalledWith(img, 0, 0, 800, 600);
    expect(gl.texImage2D).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      fakeCanvas
    );
  });

  it("rasterizes SVG data URIs via offscreen 2D canvas", () => {
    const gl = {
      TEXTURE_2D: 0x0de1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      texImage2D: vi.fn(),
      getError: vi.fn().mockReturnValue(0),
    } as unknown as WebGLRenderingContext;

    const drawImageSpy = vi.fn();
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: drawImageSpy,
      }),
    };

    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "canvas") return fakeCanvas as unknown as HTMLCanvasElement;
      return mockWindow.document.createElement(tag) as unknown as HTMLElement;
    }) as unknown as typeof document.createElement);

    const img = {
      src: "data:image/svg+xml;utf8,<svg></svg>",
      naturalWidth: 0,
      naturalHeight: 0,
      width: 300,
      height: 150,
    } as unknown as HTMLImageElement;

    uploadTextureImage(gl, img);

    // Should use fallback width/height (300/150 or default 1024)
    expect(fakeCanvas.width).toBe(300);
    expect(fakeCanvas.height).toBe(150);
    expect(gl.texImage2D).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      fakeCanvas
    );
  });

  it("uploads standard non-SVG bitmaps directly for peak performance", () => {
    const gl = {
      TEXTURE_2D: 0x0de1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      texImage2D: vi.fn(),
      getError: vi.fn().mockReturnValue(0),
    } as unknown as WebGLRenderingContext;

    const img = {
      src: "/images/texture.png",
      naturalWidth: 1024,
      naturalHeight: 1024,
      width: 1024,
      height: 1024,
    } as unknown as HTMLImageElement;

    uploadTextureImage(gl, img);

    // Direct texImage2D with the HTMLImageElement
    expect(gl.texImage2D).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      img
    );
  });

  it("falls back to 2D canvas rasterization if direct bitmap upload yields a GL error", () => {
    let callCount = 0;
    const gl = {
      TEXTURE_2D: 0x0de1,
      RGBA: 0x1908,
      UNSIGNED_BYTE: 0x1401,
      texImage2D: vi.fn(),
      getError: vi.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 1281 : 0; // First call errors (GL_INVALID_VALUE)
      }),
    } as unknown as WebGLRenderingContext;

    const drawImageSpy = vi.fn();
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        drawImage: drawImageSpy,
      }),
    };

    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "canvas") return fakeCanvas as unknown as HTMLCanvasElement;
      return mockWindow.document.createElement(tag) as unknown as HTMLElement;
    }) as unknown as typeof document.createElement);

    const img = {
      src: "/images/custom.webp",
      naturalWidth: 512,
      naturalHeight: 512,
      width: 512,
      height: 512,
    } as unknown as HTMLImageElement;

    uploadTextureImage(gl, img);

    // First tried direct img upload, then fell back to fakeCanvas
    expect(gl.texImage2D).toHaveBeenNthCalledWith(
      1,
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      img
    );
    expect(gl.texImage2D).toHaveBeenNthCalledWith(
      2,
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      fakeCanvas
    );
  });
});
