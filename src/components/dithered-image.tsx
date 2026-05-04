import { useRef, useEffect, useMemo } from "react";

type DitherMode = "floyd-steinberg" | "atkinson" | "ordered" | false;

interface DitheredImageProps {
  src: string;
  width?: number;
  height?: number;
  /** Grid spacing between dot centers in pixels */
  gridSpacing?: number;
  /** Dot size as a fraction of gridSpacing (e.g. 0.8) */
  dotScale?: number;
  /** Swap dark/light: show dots where image is bright */
  invert?: boolean;
  /** Dithering algorithm: "floyd-steinberg", "atkinson", "ordered", or false */
  dither?: DitherMode;
  /** RGB dot color tuple */
  dotColor?: [number, number, number];
  className?: string;
  /** Pixels per second the shockwave travels */
  shockwaveSpeed?: number;
  /** Half-width of the shockwave ring in pixels */
  shockwaveWidth?: number;
  /** Max displacement force from shockwave */
  shockwaveStrength?: number;
  /** How long (ms) a shockwave lasts */
  shockwaveDuration?: number;
}

interface Shockwave {
  x: number;
  y: number;
  start: number;
}

interface HalftoneState {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  baseX: Float32Array;
  baseY: Float32Array;
  renderX: Float32Array;
  renderY: Float32Array;
  renderBr: Float32Array;
  renderSize: Float32Array;
  renderTint: Float32Array;
  displaceX: Float32Array;
  displaceY: Float32Array;
  count: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  shockwaves: Shockwave[];
  _needsAnim: boolean;
  _hasDisplacement: boolean;
  buckets: { indices: Int32Array[]; lengths: Int32Array };
}

function floydSteinbergDither(imgData: ImageData, invert: boolean): Float32Array {
  const { width, height, data } = imgData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const lum = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    gray[i] = invert ? lum / 255 : 1 - lum / 255;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const old = gray[idx];
      const next = old > 0.5 ? 1.0 : 0.0;
      gray[idx] = next;
      const err = old - next;
      if (x + 1 < width) gray[idx + 1] += (err * 7) / 16;
      if (y + 1 < height) {
        if (x > 0) gray[idx + width - 1] += (err * 3) / 16;
        gray[idx + width] += (err * 5) / 16;
        if (x + 1 < width) gray[idx + width + 1] += (err * 1) / 16;
      }
    }
  }
  return gray;
}

function atkinsonDither(imgData: ImageData, invert: boolean): Float32Array {
  const { width, height, data } = imgData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const lum = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    gray[i] = invert ? lum / 255 : 1 - lum / 255;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const old = gray[idx];
      const next = old > 0.5 ? 1.0 : 0.0;
      gray[idx] = next;
      const err = (old - next) / 8;
      if (x + 1 < width) gray[idx + 1] += err;
      if (x + 2 < width) gray[idx + 2] += err;
      if (y + 1 < height) {
        if (x > 0) gray[idx + width - 1] += err;
        gray[idx + width] += err;
        if (x + 1 < width) gray[idx + width + 1] += err;
      }
      if (y + 2 < height) gray[idx + 2 * width] += err;
    }
  }
  return gray;
}

const BAYER4 = [
  [1, 9, 3, 11],
  [13, 5, 15, 7],
  [4, 12, 2, 10],
  [16, 8, 14, 6],
];

function orderedDither(imgData: ImageData, invert: boolean): Float32Array {
  const { width, height, data } = imgData;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const lum = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
      const normalized = invert ? lum / 255 : 1 - lum / 255;
      const threshold = BAYER4[y % 4][x % 4] / 17;
      gray[i] = normalized > threshold ? 1.0 : 0.0;
    }
  }
  return gray;
}

function buildState(
  canvas: HTMLCanvasElement,
  imgData: ImageData,
  gridSpacing: number,
  dotScale: number,
  invert: boolean,
  dither: DitherMode
): HalftoneState {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const iw = imgData.width;
  const ih = imgData.height;
  const pixels = imgData.data;
  const dotSize = gridSpacing * dotScale;

  const dithered =
    dither === "floyd-steinberg"
      ? floydSteinbergDither(imgData, invert)
      : dither === "atkinson"
        ? atkinsonDither(imgData, invert)
        : dither === "ordered"
          ? orderedDither(imgData, invert)
          : null;

  const xs: number[] = [];
  const ys: number[] = [];
  const brs: number[] = [];

  for (let gy = gridSpacing / 2; gy < h; gy += gridSpacing) {
    for (let gx = gridSpacing / 2; gx < w; gx += gridSpacing) {
      const ix = Math.min(iw - 1, Math.floor((gx / w) * iw));
      const iy = Math.min(ih - 1, Math.floor((gy / h) * ih));
      let brightness: number;
      if (dithered) {
        brightness = dithered[iy * iw + ix];
      } else {
        const i = (iy * iw + ix) * 4;
        const luminance = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        brightness = invert ? luminance / 255 : 1 - luminance / 255;
      }
      if (brightness > 0.5) {
        xs.push(gx);
        ys.push(gy);
        brs.push(1.0);
      } else if (!dithered && brightness > 0.05) {
        xs.push(gx);
        ys.push(gy);
        brs.push(brightness);
      }
    }
  }

  const count = xs.length;
  const baseX = new Float32Array(xs);
  const baseY = new Float32Array(ys);
  const renderX = new Float32Array(baseX);
  const renderY = new Float32Array(baseY);
  const renderBr = new Float32Array(brs);
  const renderSize = new Float32Array(count).fill(dotSize);
  const renderTint = new Float32Array(count).fill(1);
  const displaceX = new Float32Array(count);
  const displaceY = new Float32Array(count);

  return {
    ctx,
    w,
    h,
    baseX,
    baseY,
    renderX,
    renderY,
    renderBr,
    renderSize,
    renderTint,
    displaceX,
    displaceY,
    count,
    mouseX: -9999,
    mouseY: -9999,
    mouseActive: false,
    shockwaves: [],
    _needsAnim: false,
    _hasDisplacement: false,
    buckets: {
      indices: Array.from({ length: 126 }, () => new Int32Array(count)),
      lengths: new Int32Array(126),
    },
  };
}

function drawFrame(s: HalftoneState, cr: number, cg: number, cb: number) {
  const { ctx, renderX, renderY, renderBr, renderSize, renderTint, count, w, h, buckets } = s;

  ctx.clearRect(0, 0, w, h);
  buckets.lengths.fill(0);

  for (let v = 0; v < count; v++) {
    const br = renderBr[v];
    if (br < 0.01) continue;
    const key = 6 * Math.round(20 * br) + Math.round(5 * renderTint[v]);
    buckets.indices[key][buckets.lengths[key]++] = v;
  }

  for (let z = 0; z < 126; z++) {
    const len = buckets.lengths[z];
    if (len === 0) continue;
    const alpha = Math.floor(z / 6) / 20;
    const indices = buckets.indices[z];
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
    for (let zi = 0; zi < len; zi++) {
      const i = indices[zi];
      const size = renderSize[i];
      ctx.fillRect(renderX[i] - 0.25, renderY[i] - 0.25, size + 0.5, size + 0.5);
    }
  }
}

export default function DitheredImage({
  src,
  width = 300,
  height = 300,
  gridSpacing = 6,
  dotScale = 0.8,
  invert = false,
  dither = false as DitherMode,
  dotColor = [138, 143, 152],
  shockwaveSpeed = 200,
  shockwaveWidth = 25,
  shockwaveStrength = 12,
  shockwaveDuration = 1500,
  className,
}: DitheredImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<HalftoneState | null>(null);
  const imgDataRef = useRef<ImageData | null>(null);

  const swConfig = useMemo(
    () => ({ shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration }),
    [shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration]
  );

  // Keep dotColor stable even when passed as a literal array
  const [cr, cg, cb] = dotColor;
  const dotColorRef = useRef<[number, number, number]>([cr, cg, cb]);
  useEffect(() => {
    dotColorRef.current = [cr, cg, cb];
  }, [cr, cg, cb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number | null = null;

    const tick = (ts: number) => {
      const s = stateRef.current;
      if (!s) return;

      s._needsAnim = false;
      const { shockwaveDuration: swDur } = swConfig;
      s.shockwaves = s.shockwaves.filter((sw) => ts - sw.start < swDur);
      const hasShockwaves = s.shockwaves.length > 0;

      if (s.mouseActive || hasShockwaves || s._hasDisplacement) {
        const swScale = 1 + (s.shockwaves.length - 1) * 0.5;
        if (hasShockwaves) s._needsAnim = true;
        s._hasDisplacement = false;

        for (let i = 0; i < s.count; i++) {
          const bx = s.baseX[i];
          const by = s.baseY[i];
          let nx = 0;
          let ny = 0;

          // Mouse repulsion — cubic falloff within 100px, strength 40
          if (s.mouseActive) {
            const dx = bx + s.displaceX[i] - s.mouseX;
            const dy = by + s.displaceY[i] - s.mouseY;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 10000 && dist2 > 0.1) {
              const dist = Math.sqrt(dist2);
              const t = 1 - dist / 100;
              const force = t * t * t * 40;
              nx = (dx / dist) * force;
              ny = (dy / dist) * force;
            }
          }

          // Shockwave — expanding ring with decay
          for (let si = 0; si < s.shockwaves.length; si++) {
            const sw = s.shockwaves[si];
            const waveFront = ((ts - sw.start) / 1000) * swConfig.shockwaveSpeed;
            const decay = 1 - (ts - sw.start) / swDur;
            const dx = bx - sw.x;
            const dy = by - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) continue;
            const distToWave = Math.abs(dist - waveFront);
            if (distToWave < swConfig.shockwaveWidth) {
              const force =
                (1 - distToWave / swConfig.shockwaveWidth) *
                decay *
                swConfig.shockwaveStrength *
                swScale;
              nx += (dx / dist) * force;
              ny += (dy / dist) * force;
            }
          }

          // Spring toward target with easing
          s.displaceX[i] += (nx - s.displaceX[i]) * 0.12;
          s.displaceY[i] += (ny - s.displaceY[i]) * 0.12;
          if (Math.abs(s.displaceX[i]) < 0.01) s.displaceX[i] = 0;
          if (Math.abs(s.displaceY[i]) < 0.01) s.displaceY[i] = 0;
          if (s.displaceX[i] !== 0 || s.displaceY[i] !== 0) {
            s._needsAnim = true;
            s._hasDisplacement = true;
          }
          s.renderX[i] = bx + s.displaceX[i];
          s.renderY[i] = by + s.displaceY[i];
        }
      }

      const [r, g, b] = dotColorRef.current;
      drawFrame(s, r, g, b);

      rafId = s.mouseActive || s._needsAnim ? requestAnimationFrame(tick) : null;
    };

    const rebuild = () => {
      const imgData = imgDataRef.current;
      if (!imgData) return;
      stateRef.current = buildState(canvas, imgData, gridSpacing, dotScale, invert, dither);
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const octx = offscreen.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      imgDataRef.current = octx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      rebuild();
    };
    img.src = src;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const s = stateRef.current;
      if (!s) return;
      const { x, y } = getPos(e);
      s.mouseX = x;
      s.mouseY = y;
      s.mouseActive = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onPointerLeave = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s && e.pointerType === "mouse") {
        s.mouseActive = false;
        if (!rafId) rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s) return;
      const { x, y } = getPos(e);
      s.shockwaves.push({ x, y, start: performance.now() });
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", rebuild);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      img.onload = null;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", rebuild);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [src, gridSpacing, dotScale, invert, dither, swConfig]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block", cursor: "crosshair" }}
      className={className}
    />
  );
}
