"use client";

import React, { useRef, useEffect } from "react";
import { createKomorebiField } from "@/lib/procedural/komorebi";

export interface ProceduralKomorebiProps {
  basePlate: string;
  shadowOpacity: number;
  scale: number;
  speed: number;
  contrast: number;
  windAngle: number;
  mode?: "gpu" | "cpu";
  onFrameStats?: (stats: {
    frameTimeMs: number;
    fps: number;
    memoryKb: number;
    mode: "gpu" | "cpu";
  }) => void;
}

const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Ashima Arts / Stefan Gustavson Simplex Noise in GLSL
const FS_SOURCE = `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_baseTexture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;
uniform float u_shadowOpacity;
uniform vec2 u_windDir;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, float t) {
  float value = 0.0;
  float amplitude = 0.55;
  float frequency = 1.0;
  
  vec2 warp = vec2(
    snoise(p * 0.8 + u_windDir * t * 0.3),
    snoise(p * 0.8 - u_windDir * t * 0.3 + vec2(5.2, 1.3))
  );
  p += warp * 0.15;

  for (int i = 0; i < 3; i++) {
    vec2 offset = vec2(sin(t * 0.4 + float(i)), cos(t * 0.3 + float(i))) * 0.08;
    value += amplitude * snoise(p * frequency + offset + u_windDir * t * 0.15);
    frequency *= 2.1;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec4 baseColor = texture2D(u_baseTexture, v_uv);

  float t = u_time * u_speed;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = v_uv * aspect * u_scale;

  float raw = fbm(p, t);
  float norm = clamp((raw + 1.0) * 0.5, 0.0, 1.0);
  float shadowDensity = pow(norm, u_contrast);

  vec3 shadedColor = baseColor.rgb * (1.0 - shadowDensity * u_shadowOpacity);
  gl_FragColor = vec4(shadedColor, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ProceduralKomorebiEngine({
  basePlate,
  shadowOpacity,
  scale,
  speed,
  contrast,
  windAngle,
  mode = "gpu",
  onFrameStats,
}: ProceduralKomorebiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const baseTexRef = useRef<WebGLTexture | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);

  // Keep live props in ref to avoid tearing down rAF loop
  const propsRef = useRef({
    shadowOpacity,
    scale,
    speed,
    contrast,
    windAngle,
    mode,
    onFrameStats,
  });

  useEffect(() => {
    propsRef.current = {
      shadowOpacity,
      scale,
      speed,
      contrast,
      windAngle,
      mode,
      onFrameStats,
    };
  });

  const startTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);
  const execTimesRef = useRef<number[]>([]);

  // Init WebGL for GPU mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === "gpu") {
      const gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
      if (!gl) return;
      glRef.current = gl;

      const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
      }
      programRef.current = program;

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      const aPos = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      baseTexRef.current = tex;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      return () => {
        gl.deleteProgram(program);
        if (tex) gl.deleteTexture(tex);
      };
    }
  }, [mode]);

  // Load Base Plate Image
  useEffect(() => {
    const img = new window.Image();
    img.src = basePlate;
    img.onload = () => {
      baseImgRef.current = img;
      const gl = glRef.current;
      const tex = baseTexRef.current;
      if (gl && tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }
    };
  }, [basePlate]);

  // Unified Render Loop
  useEffect(() => {
    let rafId: number;
    startTimeRef.current = performance.now();
    lastReportRef.current = startTimeRef.current;

    const render = (now: number) => {
      frameCountRef.current++;
      const currentProps = propsRef.current;
      const canvas = canvasRef.current;
      const elapsed = (now - startTimeRef.current) / 1000;

      const t0 = performance.now();

      if (canvas) {
        if (currentProps.mode === "gpu") {
          const gl = glRef.current;
          const program = programRef.current;
          if (gl && program) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, baseTexRef.current);
            gl.uniform1i(gl.getUniformLocation(program, "u_baseTexture"), 0);

            gl.uniform2f(
              gl.getUniformLocation(program, "u_resolution"),
              canvas.clientWidth,
              canvas.clientHeight
            );
            gl.uniform1f(gl.getUniformLocation(program, "u_time"), elapsed);
            gl.uniform1f(gl.getUniformLocation(program, "u_scale"), currentProps.scale);
            gl.uniform1f(gl.getUniformLocation(program, "u_speed"), currentProps.speed);
            gl.uniform1f(gl.getUniformLocation(program, "u_contrast"), currentProps.contrast);
            gl.uniform1f(gl.getUniformLocation(program, "u_shadowOpacity"), currentProps.shadowOpacity);

            const rad = (currentProps.windAngle * Math.PI) / 180;
            gl.uniform2f(
              gl.getUniformLocation(program, "u_windDir"),
              Math.cos(rad),
              Math.sin(rad)
            );

            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
        } else {
          // CPU Simplex streaming via createKomorebiField into 2D canvas
          const ctx = canvas.getContext("2d");
          const baseImg = baseImgRef.current;
          if (ctx && baseImg) {
            const w = 96; // Downsampled grid for CPU performance
            const h = 54;
            const field = createKomorebiField(w, h, elapsed * currentProps.speed, {
              scale: currentProps.scale,
              contrast: currentProps.contrast,
            });

            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

            const imgData = ctx.createImageData(w, h);
            for (let i = 0; i < field.length; i++) {
              const alpha = Math.round(field[i] * currentProps.shadowOpacity * 255);
              const p = i * 4;
              imgData.data[p] = 0;
              imgData.data[p + 1] = 0;
              imgData.data[p + 2] = 0;
              imgData.data[p + 3] = alpha;
            }

            // Draw to temp offscreen and upscale
            createImageBitmap(imgData).then((bmp) => {
              ctx.save();
              ctx.globalCompositeOperation = "multiply";
              ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
              ctx.restore();
            });
          }
        }
      }

      const execTime = performance.now() - t0;
      execTimesRef.current.push(execTime);

      // Report telemetry every 500ms
      if (now - lastReportRef.current >= 500) {
        const timeSpan = (now - lastReportRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / timeSpan);
        frameCountRef.current = 0;
        lastReportRef.current = now;

        const avgExec =
          execTimesRef.current.reduce((a, b) => a + b, 0) /
          Math.max(1, execTimesRef.current.length);
        execTimesRef.current = [];

        // Real memory allocation footprint
        const memoryKb =
          currentProps.mode === "gpu"
            ? 0 // Pure shader, zero heap buffer
            : Math.round((96 * 54 * 4 * 2) / 1024); // CPU Float32 + ImageData buffers

        currentProps.onFrameStats?.({
          frameTimeMs: Math.round(avgExec * 100) / 100,
          fps,
          memoryKb,
          mode: currentProps.mode,
        });
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [mode]);

  // Sizing
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
    const obs = new ResizeObserver(updateSize);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
