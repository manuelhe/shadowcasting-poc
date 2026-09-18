"use client";

import React, { useRef, useEffect } from "react";
import { ShadowEngineProps } from "./CssShadowEngine";
import { parseColorToRgb } from "./color-utils";
import { uploadTextureImage } from "./texture-utils";

export interface WebGlShadowEngineProps extends ShadowEngineProps {
  contactHardening?: boolean;
  contactPoint?: [number, number];
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  // Map [-1, 1] position to [0, 1] UV
  v_uv = (a_position + 1.0) * 0.5;
  // Flip Y for texture coordinates
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_baseTexture;
uniform sampler2D u_casterTexture;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_scale;
uniform float u_blurRadius;
uniform float u_shadowOpacity;
uniform float u_contactHardening;
uniform vec2 u_contactPoint;
uniform vec3 u_shadowColor;
uniform float u_useBaseTexture;

void main() {
  // Transform UV coordinate for shadow caster
  vec2 centeredUV = v_uv - vec2(0.5);
  vec2 casterUV = (centeredUV - u_offset) / u_scale + vec2(0.5);

  // Physical contact hardening factor:
  // Root / branch stem near contact point (u_contactPoint) has sharp penumbra;
  // outer leaf tips exhibit wide, soft penumbra.
  float dist = clamp(length(casterUV - u_contactPoint) * 1.5, 0.15, 1.8);
  float penumbraFactor = mix(1.0, dist, u_contactHardening);

  // Effective blur radius in UV space
  vec2 texelSize = 1.0 / u_resolution;
  vec2 radiusUV = texelSize * (u_blurRadius * penumbraFactor);

  // 12-tap golden-spiral Poisson disk for soft penumbra
  float shadowDensity = 0.0;
  float totalWeight = 0.0;

  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float angle = fi * 2.39996323; // Golden angle in radians
    float r = sqrt(fi + 0.5) / 3.4641; // sqrt(12.0) = 3.4641
    vec2 tapOffset = vec2(cos(angle), sin(angle)) * r * radiusUV;
    vec2 sampleUV = casterUV + tapOffset;

    if (sampleUV.x >= 0.0 && sampleUV.x <= 1.0 && sampleUV.y >= 0.0 && sampleUV.y <= 1.0) {
      float alpha = texture2D(u_casterTexture, sampleUV).a;
      shadowDensity += alpha;
    }
    totalWeight += 1.0;
  }

  float avgShadow = shadowDensity / totalWeight;

  if (u_useBaseTexture > 0.5) {
    vec4 baseColor = texture2D(u_baseTexture, v_uv);
    // Multiply composite on base plate for backward compatibility
    vec3 finalColor = baseColor.rgb * (1.0 - (avgShadow * u_shadowOpacity));
    gl_FragColor = vec4(finalColor, 1.0);
  } else {
    // Pure transparent alpha shadow synthesis
    gl_FragColor = vec4(u_shadowColor, avgShadow * u_shadowOpacity);
  }
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const DEFAULT_CONTACT_POINT: [number, number] = [0.1, 0.1];

export function WebGlShadowEngine({
  baseImage,
  casterImage,
  offsetX,
  offsetY,
  blurRadius,
  shadowOpacity,
  shadowColor = "#000000",
  ambientScale,
  contactHardening = true,
  contactPoint = DEFAULT_CONTACT_POINT,
  onFrameStats,
}: WebGlShadowEngineProps) {
  const [cpX, cpY] = contactPoint ?? DEFAULT_CONTACT_POINT;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const baseTexRef = useRef<WebGLTexture | null>(null);
  const casterTexRef = useRef<WebGLTexture | null>(null);
  const texturesReadyRef = useRef(false);

  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  // Initialize WebGL context & shaders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }
    glRef.current = gl;

    // Set clear color to transparent and configure standard alpha blending
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vShader || !fShader) return;

    const program = createProgram(gl, vShader, fShader);
    if (!program) return;
    programRef.current = program;

    // Quad geometry: 2 triangles covering [-1, 1]
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Create caster texture only.
    // Base texture allocation is skipped entirely when baseImage is omitted (Zero-Base VRAM Mode).
    const casterTex = gl.createTexture();
    casterTexRef.current = casterTex;

    // Placeholder 1x1 pixel while caster image loads
    gl.bindTexture(gl.TEXTURE_2D, casterTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([200, 200, 200, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return () => {
      if (program) gl.deleteProgram(program);
      if (baseTexRef.current) {
        gl.deleteTexture(baseTexRef.current);
        baseTexRef.current = null;
      }
      if (casterTexRef.current) {
        gl.deleteTexture(casterTexRef.current);
        casterTexRef.current = null;
      }
    };
  }, []);

  // Load and upload textures
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    texturesReadyRef.current = false;
    let loaded = 0;
    const required = baseImage ? 2 : 1;

    const uploadImage = (img: HTMLImageElement, tex: WebGLTexture | null) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      uploadTextureImage(gl, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    // Only load and allocate base texture if baseImage is provided
    if (baseImage) {
      if (!baseTexRef.current) {
        const baseTex = gl.createTexture();
        baseTexRef.current = baseTex;
        gl.bindTexture(gl.TEXTURE_2D, baseTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([200, 200, 200, 255])
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }

      const bImg = new window.Image();
      bImg.src = baseImage;
      bImg.onload = () => {
        if (gl && baseTexRef.current) {
          uploadImage(bImg, baseTexRef.current);
          loaded++;
          if (loaded === required) texturesReadyRef.current = true;
        }
      };
    } else {
      // Release base texture if omitted
      if (baseTexRef.current) {
        gl.deleteTexture(baseTexRef.current);
        baseTexRef.current = null;
      }
    }

    const cImg = new window.Image();
    cImg.src = casterImage;
    cImg.onload = () => {
      if (gl && casterTexRef.current) {
        uploadImage(cImg, casterTexRef.current);
        loaded++;
        if (loaded === required) texturesReadyRef.current = true;
      }
    };
  }, [baseImage, casterImage]);

  // Main WebGL render loop
  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();
    lastReportRef.current = lastTimeRef.current;

    const render = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      frameCountRef.current++;

      if (now - lastReportRef.current >= 500) {
        const elapsed = (now - lastReportRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / elapsed);
        frameCountRef.current = 0;
        lastReportRef.current = now;
        onFrameStats?.({
          frameTimeMs: Math.round(delta * 10) / 10,
          fps,
        });
      }

      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;

      if (gl && program && canvas) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        if (baseImage && baseTexRef.current) {
          // Bind Base Texture to Unit 0
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, baseTexRef.current);
          gl.uniform1i(gl.getUniformLocation(program, "u_baseTexture"), 0);

          // Bind Caster Texture to Unit 1
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, casterTexRef.current);
          gl.uniform1i(gl.getUniformLocation(program, "u_casterTexture"), 1);

          gl.uniform1f(gl.getUniformLocation(program, "u_useBaseTexture"), 1.0);
        } else {
          // Zero-Base VRAM mode: do not bind u_baseTexture, bind caster to Unit 0
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, casterTexRef.current);
          gl.uniform1i(gl.getUniformLocation(program, "u_casterTexture"), 0);

          gl.uniform1f(gl.getUniformLocation(program, "u_useBaseTexture"), 0.0);
        }

        // Set normalized shadow color uniform
        const [r, g, b] = parseColorToRgb(shadowColor);
        gl.uniform3f(gl.getUniformLocation(program, "u_shadowColor"), r, g, b);

        // Uniforms
        gl.uniform2f(
          gl.getUniformLocation(program, "u_resolution"),
          canvas.clientWidth,
          canvas.clientHeight
        );

        // Normalized offset in UV space
        const normOffsetX = offsetX / (canvas.clientWidth || 1);
        const normOffsetY = offsetY / (canvas.clientHeight || 1);
        gl.uniform2f(
          gl.getUniformLocation(program, "u_offset"),
          normOffsetX,
          normOffsetY
        );

        gl.uniform1f(gl.getUniformLocation(program, "u_scale"), ambientScale);
        gl.uniform1f(gl.getUniformLocation(program, "u_blurRadius"), blurRadius);
        gl.uniform1f(gl.getUniformLocation(program, "u_shadowOpacity"), shadowOpacity);
        gl.uniform1f(
          gl.getUniformLocation(program, "u_contactHardening"),
          contactHardening ? 1.0 : 0.0
        );
        const contactPointLoc = gl.getUniformLocation(program, "u_contactPoint");
        gl.uniform2f(contactPointLoc, cpX, cpY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [
    baseImage,
    casterImage,
    offsetX,
    offsetY,
    blurRadius,
    shadowOpacity,
    shadowColor,
    ambientScale,
    contactHardening,
    cpX,
    cpY,
    onFrameStats,
  ]);

  // Handle canvas sizing to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden select-none",
        baseImage ? "bg-zinc-950" : "bg-transparent",
      ].join(" ")}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
