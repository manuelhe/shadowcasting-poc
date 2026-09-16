"use client";

import React, { useRef, useEffect } from "react";

export interface ProceduralKomorebiProps {
  baseImage: string;
  shadowOpacity: number;
  scale: number;
  speed: number;
  contrast: number;
  windAngle: number;
  onFrameStats?: (stats: { frameTimeMs: number; fps: number }) => void;
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

// Simplex 2D noise helpers
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

// Multi-octave fBm with wind drift and domain warping
float fbm(vec2 p, float t) {
  float value = 0.0;
  float amplitude = 0.55;
  float frequency = 1.0;
  
  // Domain warping for organic canopy swirl
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

  // Generate dappled canopy noise
  float raw = fbm(p, t);
  float norm = clamp((raw + 1.0) * 0.5, 0.0, 1.0);

  // Aperture contrast curve to simulate leaves opening and dappled sun spots
  float shadowDensity = pow(norm, u_contrast);

  // Multiply blend onto base plate
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
  baseImage,
  shadowOpacity,
  scale,
  speed,
  contrast,
  windAngle,
  onFrameStats,
}: ProceduralKomorebiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const baseTexRef = useRef<WebGLTexture | null>(null);

  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastReportRef = useRef(0);

  // Init WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // Quad
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
  }, []);

  // Texture upload
  useEffect(() => {
    const gl = glRef.current;
    const tex = baseTexRef.current;
    if (!gl || !tex) return;

    const img = new window.Image();
    img.src = baseImage;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
  }, [baseImage]);

  // Render loop
  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();
    lastReportRef.current = lastTimeRef.current;
    const startTime = performance.now();

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
        gl.useProgram(program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, baseTexRef.current);
        gl.uniform1i(gl.getUniformLocation(program, "u_baseTexture"), 0);

        gl.uniform2f(
          gl.getUniformLocation(program, "u_resolution"),
          canvas.clientWidth,
          canvas.clientHeight
        );
        gl.uniform1f(
          gl.getUniformLocation(program, "u_time"),
          (now - startTime) / 1000
        );
        gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale);
        gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed);
        gl.uniform1f(gl.getUniformLocation(program, "u_contrast"), contrast);
        gl.uniform1f(gl.getUniformLocation(program, "u_shadowOpacity"), shadowOpacity);

        // Wind vector from angle
        const rad = (windAngle * Math.PI) / 180;
        gl.uniform2f(
          gl.getUniformLocation(program, "u_windDir"),
          Math.cos(rad),
          Math.sin(rad)
        );

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [scale, speed, contrast, shadowOpacity, windAngle, onFrameStats]);

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
