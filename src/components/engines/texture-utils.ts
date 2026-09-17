/**
 * Utility functions for robust WebGL texture management.
 */

/**
 * Safely uploads an HTMLImageElement to a WebGL texture across all browsers.
 *
 * In Chromium (Blink), SVGs without explicit intrinsic pixel dimensions (e.g. width="100%" height="100%")
 * fail when passed directly to `gl.texImage2D(..., img)` with:
 *   "WebGL: INVALID_VALUE: texImage2D: bad image data" (GL error 1281 / 0x0501).
 *
 * This function ensures that:
 * 1. SVGs or images lacking natural pixel dimensions are rasterized via an offscreen 2D canvas,
 *    which Chromium accepts unconditionally.
 * 2. Standard bitmap images (PNG, JPEG, WebP) are uploaded directly via texImage2D for maximum performance,
 *    falling back to 2D canvas rasterization if direct upload fails.
 */
export function uploadTextureImage(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  img: HTMLImageElement
): void {
  const isSvg =
    img.src.includes(".svg") ||
    img.src.startsWith("data:image/svg+xml") ||
    Boolean(img.currentSrc && img.currentSrc.includes(".svg"));

  if (isSvg) {
    rasterizeAndUpload(gl, img);
    return;
  }

  // For non-SVG bitmaps, direct upload is fastest and fully supported.
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (gl.getError() === 0) {
      return;
    }
  }

  // Fallback for missing natural dimensions or direct upload failure
  rasterizeAndUpload(gl, img);
}

function rasterizeAndUpload(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  img: HTMLImageElement
): void {
  // Use natural dimensions if valid, otherwise fallback to element dimensions or default 1024
  const width = img.naturalWidth || img.width || 1024;
  const height = img.naturalHeight || img.height || 1024;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  }
}
