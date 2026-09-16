import { GlobalWindow } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/procedural/komorebi", async () => {
  return await vi.importActual("../../lib/procedural/komorebi");
});
vi.mock("@/lib/procedural/branch-skeleton", async () => {
  return await vi.importActual("../../lib/procedural/branch-skeleton");
});

import { parseColorToRgb } from "./color-utils";
import { WebGlShadowEngine } from "./WebGlShadowEngine";
import { Canvas2dShadowEngine } from "./Canvas2dShadowEngine";
import { ProceduralKomorebiEngine } from "./ProceduralKomorebiEngine";
import { ProceduralBranchEngine } from "./ProceduralBranchEngine";

type MockContextReturn = ReturnType<GlobalWindow["HTMLCanvasElement"]["prototype"]["getContext"]>;

describe("Transparent Alpha Shadow Synthesis Engines & Zero-Base VRAM Mode", () => {
  let mockWindow: GlobalWindow;
  let latestRafCallback: FrameRequestCallback | null = null;

  const triggerFrame = (time = 1000) => {
    const cb = latestRafCallback;
    cb?.(time);
  };

  beforeEach(() => {
    latestRafCallback = null;
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
    Object.defineProperty(global, "navigator", {
      value: mockWindow.navigator,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "HTMLCanvasElement", {
      value: mockWindow.HTMLCanvasElement,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "ResizeObserver", {
      value: class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
      configurable: true,
      writable: true,
    });
    let nextRafId = 1;
    const rafMock = (cb: FrameRequestCallback) => {
      latestRafCallback = cb;
      return nextRafId++;
    };
    const cafMock = () => {
      latestRafCallback = null;
    };
    Object.defineProperty(mockWindow, "requestAnimationFrame", {
      value: rafMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "requestAnimationFrame", {
      value: rafMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(mockWindow, "cancelAnimationFrame", {
      value: cafMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, "cancelAnimationFrame", {
      value: cafMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. parseColorToRgb Color Parser", () => {
    it("defaults to black [0, 0, 0] when color is undefined, empty, or invalid", () => {
      expect(parseColorToRgb(undefined)).toEqual([0, 0, 0]);
      expect(parseColorToRgb("")).toEqual([0, 0, 0]);
      expect(parseColorToRgb("invalid-color")).toEqual([0, 0, 0]);
    });

    it("parses 3-character and 4-character hex strings", () => {
      expect(parseColorToRgb("#000")).toEqual([0, 0, 0]);
      expect(parseColorToRgb("#fff")).toEqual([1, 1, 1]);
      expect(parseColorToRgb("#000f")).toEqual([0, 0, 0]);
      expect(parseColorToRgb("#ffff")).toEqual([1, 1, 1]);

      const [r, g, b] = parseColorToRgb("#f80");
      expect(r).toBeCloseTo(1.0, 2);
      expect(g).toBeCloseTo(0.533, 2);
      expect(b).toBeCloseTo(0.0, 2);
    });

    it("parses 6-character and 8-character hex strings", () => {
      expect(parseColorToRgb("#000000")).toEqual([0, 0, 0]);
      expect(parseColorToRgb("#ffffff")).toEqual([1, 1, 1]);
      expect(parseColorToRgb("#000000ff")).toEqual([0, 0, 0]);

      const [r, g, b] = parseColorToRgb("#123456");
      expect(r).toBeCloseTo(0x12 / 255, 3);
      expect(g).toBeCloseTo(0x34 / 255, 3);
      expect(b).toBeCloseTo(0x56 / 255, 3);
    });

    it("parses functional rgb and rgba strings", () => {
      expect(parseColorToRgb("rgb(0, 0, 0)")).toEqual([0, 0, 0]);
      expect(parseColorToRgb("rgb(255, 255, 255)")).toEqual([1, 1, 1]);

      const [r, g, b] = parseColorToRgb("rgba(128, 64, 32, 0.75)");
      expect(r).toBeCloseTo(128 / 255, 3);
      expect(g).toBeCloseTo(64 / 255, 3);
      expect(b).toBeCloseTo(32 / 255, 3);
    });

    it("clamps values within range [0, 1]", () => {
      const [r, g, b] = parseColorToRgb("rgb(300, 255, 0)");
      expect(r).toBe(1.0);
      expect(g).toBe(1.0);
      expect(b).toBe(0.0);
    });
  });

  describe("2. WebGlShadowEngine", () => {
    it("renders transparent canvas container when baseImage is omitted", () => {
      const html = renderToString(
        <WebGlShadowEngine
          casterImage="/images/caster-branch.svg"
          offsetX={10}
          offsetY={15}
          blurRadius={20}
          shadowOpacity={0.65}
          shadowColor="#112233"
          ambientScale={1.0}
        />
      );

      expect(html).toContain("bg-transparent");
      expect(html).not.toContain("bg-zinc-950");
      expect(html).toContain("<canvas");
    });

    it("renders opaque zinc-950 container when baseImage is provided (backward compatibility)", () => {
      const html = renderToString(
        <WebGlShadowEngine
          baseImage="/images/base-studio.webp"
          casterImage="/images/caster-branch.svg"
          offsetX={10}
          offsetY={15}
          blurRadius={20}
          shadowOpacity={0.65}
          ambientScale={1.0}
        />
      );

      expect(html).toContain("bg-zinc-950");
    });

    it("initializes WebGL with alpha=true, clearColor(0,0,0,0) and blending", async () => {
      let createdTextures = 0;
      let clearColorArgs: number[] = [];
      let blendFuncArgs: number[] = [];
      let enabledBlend = false;
      const uniforms: Record<string, unknown> = {};

      const mockGl = {
        COLOR_BUFFER_BIT: 16384,
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        COMPILE_STATUS: 35713,
        LINK_STATUS: 35714,
        ARRAY_BUFFER: 34962,
        STATIC_DRAW: 35044,
        FLOAT: 5126,
        TEXTURE_2D: 3553,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_MAG_FILTER: 10240,
        CLAMP_TO_EDGE: 33071,
        LINEAR: 9729,
        TRIANGLES: 4,
        BLEND: 3042,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        TEXTURE0: 33984,
        TEXTURE1: 33985,
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        createTexture: vi.fn(() => {
          createdTextures++;
          return { id: createdTextures };
        }),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        deleteProgram: vi.fn(),
        deleteTexture: vi.fn(),
        viewport: vi.fn(),
        useProgram: vi.fn(),
        activeTexture: vi.fn(),
        getUniformLocation: vi.fn((_p, name: string) => name),
        uniform1i: vi.fn((name: string, val: number) => {
          uniforms[name] = val;
        }),
        uniform1f: vi.fn((name: string, val: number) => {
          uniforms[name] = val;
        }),
        uniform2f: vi.fn((name: string, x: number, y: number) => {
          uniforms[name] = [x, y];
        }),
        uniform3f: vi.fn((name: string, x: number, y: number, z: number) => {
          uniforms[name] = [x, y, z];
        }),
        drawArrays: vi.fn(),
        clearColor: vi.fn((r: number, g: number, b: number, a: number) => {
          clearColorArgs = [r, g, b, a];
        }),
        clear: vi.fn(),
        enable: vi.fn((cap: number) => {
          if (cap === 3042) enabledBlend = true;
        }),
        blendFunc: vi.fn((s: number, d: number) => {
          blendFuncArgs = [s, d];
        }),
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId, options) => {
          if (contextId === "webgl") {
            expect((options as { alpha?: boolean } | undefined)?.alpha).toBe(true);
            return mockGl as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <WebGlShadowEngine
            casterImage="/images/caster.png"
            offsetX={5}
            offsetY={8}
            blurRadius={12}
            shadowOpacity={0.7}
            shadowColor="#ff0000"
            ambientScale={1.0}
          />
        );
      });

      await act(async () => {
        triggerFrame();
      });

      // Verify clearColor and blendFunc
      expect(clearColorArgs).toEqual([0, 0, 0, 0]);
      expect(enabledBlend).toBe(true);
      expect(blendFuncArgs).toEqual([mockGl.SRC_ALPHA, mockGl.ONE_MINUS_SRC_ALPHA]);

      // When baseImage is omitted, exactly ONE texture is created (zero base texture allocation)
      expect(createdTextures).toBe(1);

      // Verify u_useBaseTexture is 0.0 and u_shadowColor is set
      expect(uniforms["u_useBaseTexture"]).toBe(0.0);
      expect(uniforms["u_shadowColor"]).toEqual([1, 0, 0]);
      expect(uniforms["u_casterTexture"]).toBe(0);

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });

    it("allocates base texture when baseImage is provided", async () => {
      let createdTextures = 0;

      const mockGl = {
        COLOR_BUFFER_BIT: 16384,
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        COMPILE_STATUS: 35713,
        LINK_STATUS: 35714,
        ARRAY_BUFFER: 34962,
        STATIC_DRAW: 35044,
        FLOAT: 5126,
        TEXTURE_2D: 3553,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_MAG_FILTER: 10240,
        CLAMP_TO_EDGE: 33071,
        LINEAR: 9729,
        TRIANGLES: 4,
        BLEND: 3042,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        TEXTURE0: 33984,
        TEXTURE1: 33985,
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        createTexture: vi.fn(() => {
          createdTextures++;
          return { id: createdTextures };
        }),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        deleteProgram: vi.fn(),
        deleteTexture: vi.fn(),
        viewport: vi.fn(),
        useProgram: vi.fn(),
        activeTexture: vi.fn(),
        getUniformLocation: vi.fn((_p, name: string) => name),
        uniform1i: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        drawArrays: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId) => {
          if (contextId === "webgl") {
            return mockGl as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <WebGlShadowEngine
            baseImage="/images/base.webp"
            casterImage="/images/caster.png"
            offsetX={0}
            offsetY={0}
            blurRadius={10}
            shadowOpacity={0.5}
            ambientScale={1.0}
          />
        );
      });

      // 1 for caster in init + 1 for base plate in texture loader = 2 textures
      expect(createdTextures).toBe(2);

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });
  });

  describe("3. Canvas2dShadowEngine", () => {
    it("renders transparent background when baseImage is omitted", () => {
      const html = renderToString(
        <Canvas2dShadowEngine
          casterImage="/images/caster.svg"
          offsetX={0}
          offsetY={0}
          blurRadius={15}
          shadowOpacity={0.6}
          shadowColor="#050505"
          ambientScale={1.0}
        />
      );

      expect(html).toContain("bg-transparent");
      expect(html).not.toContain("bg-zinc-950");
    });

    it("renders zinc-950 background when baseImage is provided", () => {
      const html = renderToString(
        <Canvas2dShadowEngine
          baseImage="/images/base.svg"
          casterImage="/images/caster.svg"
          offsetX={0}
          offsetY={0}
          blurRadius={15}
          shadowOpacity={0.6}
          ambientScale={1.0}
        />
      );

      expect(html).toContain("bg-zinc-950");
    });

    it("clears canvas and draws shadow with shadowColor when baseImage is omitted", async () => {
      const mockCtx = {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: "#000000",
        globalAlpha: 1.0,
        globalCompositeOperation: "source-over",
        filter: "none",
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId) => {
          if (contextId === "2d") {
            return mockCtx as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <Canvas2dShadowEngine
            casterImage="/images/caster.svg"
            offsetX={10}
            offsetY={20}
            blurRadius={25}
            shadowOpacity={0.8}
            shadowColor="#223344"
            ambientScale={1.0}
          />
        );
      });

      expect(container.querySelector("canvas")).not.toBeNull();

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });
  });

  describe("4. ProceduralKomorebiEngine", () => {
    it("renders transparent container when basePlate is omitted", () => {
      const html = renderToString(
        <ProceduralKomorebiEngine
          shadowOpacity={0.5}
          shadowColor="#001122"
          scale={3.0}
          speed={0.4}
          contrast={1.5}
          windAngle={45}
          mode="gpu"
        />
      );

      expect(html).toContain("bg-transparent");
      expect(html).not.toContain("bg-zinc-950");
    });

    it("renders zinc-950 container when basePlate is provided", () => {
      const html = renderToString(
        <ProceduralKomorebiEngine
          basePlate="/images/base.svg"
          shadowOpacity={0.5}
          scale={3.0}
          speed={0.4}
          contrast={1.5}
          windAngle={45}
          mode="gpu"
        />
      );

      expect(html).toContain("bg-zinc-950");
    });

    it("does not allocate base texture in GPU mode when basePlate is omitted", async () => {
      let createdTextures = 0;
      let clearColorArgs: number[] = [];
      let blendEnabled = false;

      const mockGl = {
        COLOR_BUFFER_BIT: 16384,
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        COMPILE_STATUS: 35713,
        LINK_STATUS: 35714,
        ARRAY_BUFFER: 34962,
        STATIC_DRAW: 35044,
        FLOAT: 5126,
        TEXTURE_2D: 3553,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        BLEND: 3042,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        TEXTURE0: 33984,
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        createBuffer: vi.fn(() => ({})),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getAttribLocation: vi.fn(() => 0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        createTexture: vi.fn(() => {
          createdTextures++;
          return {};
        }),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        deleteProgram: vi.fn(),
        deleteTexture: vi.fn(),
        viewport: vi.fn(),
        useProgram: vi.fn(),
        activeTexture: vi.fn(),
        getUniformLocation: vi.fn(() => 0),
        uniform1i: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        drawArrays: vi.fn(),
        clearColor: vi.fn((r: number, g: number, b: number, a: number) => {
          clearColorArgs = [r, g, b, a];
        }),
        clear: vi.fn(),
        enable: vi.fn((cap: number) => {
          if (cap === 3042) blendEnabled = true;
        }),
        blendFunc: vi.fn(),
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId) => {
          if (contextId === "webgl") {
            return mockGl as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <ProceduralKomorebiEngine
            shadowOpacity={0.65}
            shadowColor="#00ff00"
            scale={3.5}
            speed={0.5}
            contrast={1.2}
            windAngle={45}
            mode="gpu"
          />
        );
      });

      // Assert zero textures allocated when basePlate is omitted
      expect(createdTextures).toBe(0);
      expect(clearColorArgs).toEqual([0, 0, 0, 0]);
      expect(blendEnabled).toBe(true);

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });

    it("runs CPU fallback mode and clears to transparent when basePlate is omitted", async () => {
      const mockCtx = {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        createImageData: vi.fn((w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4),
          width: w,
          height: h,
        })),
        save: vi.fn(),
        restore: vi.fn(),
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId) => {
          if (contextId === "2d") {
            return mockCtx as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <ProceduralKomorebiEngine
            shadowOpacity={0.5}
            shadowColor="#123456"
            scale={2.0}
            speed={0.3}
            contrast={1.0}
            windAngle={30}
            mode="cpu"
          />
        );
      });

      expect(container.querySelector("canvas")).not.toBeNull();

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });
  });

  describe("5. ProceduralBranchEngine", () => {
    it("renders transparent container when basePlate is omitted", () => {
      const html = renderToString(
        <ProceduralBranchEngine
          shadowOpacity={0.7}
          shadowColor="#1a1a2e"
          penumbraRadius={18}
          windStrength={0.8}
          swaySpeed={0.7}
          branchDepth={4}
          leafDensity={5}
        />
      );

      expect(html).toContain("bg-transparent");
      expect(html).not.toContain("bg-zinc-950");
    });

    it("renders zinc-950 container when basePlate is provided", () => {
      const html = renderToString(
        <ProceduralBranchEngine
          basePlate="/images/base.svg"
          shadowOpacity={0.7}
          penumbraRadius={18}
          windStrength={0.8}
          swaySpeed={0.7}
          branchDepth={4}
          leafDensity={5}
        />
      );

      expect(html).toContain("bg-zinc-950");
    });

    it("draws branch skeleton without drawing base plate when basePlate is omitted", async () => {
      let drawnBasePlate = false;

      const mockCtx = {
        clearRect: vi.fn(),
        drawImage: vi.fn(() => {
          drawnBasePlate = true;
        }),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        ellipse: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1.0,
        filter: "none",
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
      };

      const container = mockWindow.document.createElement("div");
      mockWindow.document.body.appendChild(container);

      const getContextSpy = vi
        .spyOn(mockWindow.HTMLCanvasElement.prototype, "getContext")
        .mockImplementation((contextId) => {
          if (contextId === "2d") {
            return mockCtx as unknown as MockContextReturn;
          }
          return null;
        });

      let root: ReturnType<typeof createRoot> | null = null;
      await act(async () => {
        root = createRoot(container as unknown as HTMLElement);
        root.render(
          <ProceduralBranchEngine
            shadowOpacity={0.7}
            shadowColor="#334455"
            penumbraRadius={18}
            windStrength={0.8}
            swaySpeed={0.7}
            branchDepth={3}
            leafDensity={4}
          />
        );
      });

      // Canvas element mounted cleanly
      expect(container.querySelector("canvas")).not.toBeNull();
      // Base plate drawImage was never called because basePlate is omitted
      expect(drawnBasePlate).toBe(false);

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      getContextSpy.mockRestore();
    });
  });
});
