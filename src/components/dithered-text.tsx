import { useRef, useEffect, useMemo } from "react";

type DitherMode = "floyd-steinberg" | "atkinson" | "ordered" | false;

interface DitheredTextProps {
  text: string;
  width?: string | number;
  height?: string | number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  /** Average minimum distance between Voronoi seed points */
  pointSpacing?: number;
  /** Dot size as a fraction of pointSpacing */
  dotScale?: number;
  /** Swap dark/light: show dots where text is absent */
  invert?: boolean;
  /** Dithering algorithm applied to the text raster before sampling */
  dither?: DitherMode;
  /** RGB dot color tuple */
  dotColor?: [number, number, number];
  className?: string;
  shockwaveSpeed?: number;
  shockwaveWidth?: number;
  shockwaveStrength?: number;
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
  formOffsetX: Float32Array;
  formOffsetY: Float32Array;
  animating: boolean;
  count: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  shockwaves: Shockwave[];
  _needsAnim: boolean;
  _hasDisplacement: boolean;
  buckets: { indices: Int32Array[]; lengths: Int32Array };
}

// ─── Dithering ───────────────────────────────────────────────────────────────

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

// ─── Poisson disk sampling (Bridson's algorithm) ─────────────────────────────

function poissonDiskSample(w: number, h: number, minDist: number, k = 30): [number, number][] {
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.ceil(w / cellSize);
  const gridH = Math.ceil(h / cellSize);
  const grid = new Int32Array(gridW * gridH).fill(-1);
  const points: [number, number][] = [];
  const active: number[] = [];

  const addPoint = (x: number, y: number) => {
    const idx = points.length;
    points.push([x, y]);
    active.push(idx);
    grid[Math.floor(y / cellSize) * gridW + Math.floor(x / cellSize)] = idx;
  };

  addPoint(w / 2 + (Math.random() - 0.5) * minDist, h / 2 + (Math.random() - 0.5) * minDist);

  while (active.length > 0) {
    const ri = Math.floor(Math.random() * active.length);
    const [px, py] = points[active[ri]];
    let found = false;

    for (let attempt = 0; attempt < k; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const r = minDist * (1 + Math.random());
      const nx = px + Math.cos(angle) * r;
      const ny = py + Math.sin(angle) * r;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

      const gx = Math.floor(nx / cellSize);
      const gy = Math.floor(ny / cellSize);
      let ok = true;

      outer: for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ngx = gx + dx;
          const ngy = gy + dy;
          if (ngx < 0 || ngx >= gridW || ngy < 0 || ngy >= gridH) continue;
          const ni = grid[ngy * gridW + ngx];
          if (ni === -1) continue;
          const [qx, qy] = points[ni];
          if ((nx - qx) ** 2 + (ny - qy) ** 2 < minDist * minDist) {
            ok = false;
            break outer;
          }
        }
      }

      if (ok) {
        addPoint(nx, ny);
        found = true;
        break;
      }
    }

    if (!found) active.splice(ri, 1);
  }

  return points;
}

// ─── State builder ────────────────────────────────────────────────────────────

function buildState(
  canvas: HTMLCanvasElement,
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: string | number,
  pointSpacing: number,
  dotScale: number,
  invert: boolean,
  dither: DitherMode,
  prevRenderX?: Float32Array,
  prevRenderY?: Float32Array,
  prevCount?: number
): HalftoneState {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Render text onto an offscreen canvas (black text on white bg)
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const octx = offscreen.getContext("2d")!;
  octx.fillStyle = "white";
  octx.fillRect(0, 0, w, h);
  octx.fillStyle = "black";
  octx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillText(text, w / 2, h / 2);
  const imgData = octx.getImageData(0, 0, w, h);

  const dotSize = pointSpacing * dotScale;

  const dithered =
    dither === "floyd-steinberg"
      ? floydSteinbergDither(imgData, invert)
      : dither === "atkinson"
        ? atkinsonDither(imgData, invert)
        : dither === "ordered"
          ? orderedDither(imgData, invert)
          : null;

  // Voronoi seeds via Poisson disk sampling
  const seeds = poissonDiskSample(w, h, pointSpacing);

  const xs: number[] = [];
  const ys: number[] = [];
  const brs: number[] = [];

  for (const [gx, gy] of seeds) {
    const ix = Math.min(w - 1, Math.round(gx));
    const iy = Math.min(h - 1, Math.round(gy));
    let brightness: number;
    if (dithered) {
      brightness = dithered[iy * w + ix];
    } else {
      const i = (iy * w + ix) * 4;
      const lum =
        0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
      brightness = invert ? lum / 255 : 1 - lum / 255;
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

  const count = xs.length;
  const baseX = new Float32Array(xs);
  const baseY = new Float32Array(ys);
  const formOffsetX = new Float32Array(count);
  const formOffsetY = new Float32Array(count);

  if (prevRenderX && prevRenderY && prevCount && prevCount > 0) {
    // Build a spatial grid from previous render positions for fast nearest-neighbor lookup
    const cellSize = 20;
    const gridCols = Math.ceil(w / cellSize) + 1;
    const gridRows = Math.ceil(h / cellSize) + 1;
    const grid: number[][] = Array.from({ length: gridCols * gridRows }, () => []);
    for (let j = 0; j < prevCount; j++) {
      const gx = Math.max(0, Math.min(gridCols - 1, Math.floor(prevRenderX[j] / cellSize)));
      const gy = Math.max(0, Math.min(gridRows - 1, Math.floor(prevRenderY[j] / cellSize)));
      grid[gy * gridCols + gx].push(j);
    }
    for (let i = 0; i < count; i++) {
      const gx = Math.floor(xs[i] / cellSize);
      const gy = Math.floor(ys[i] / cellSize);
      let minDist2 = Infinity;
      let nearestX = -1;
      let nearestY = -1;
      outer: for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const ngx = gx + dx;
          const ngy = gy + dy;
          if (ngx < 0 || ngx >= gridCols || ngy < 0 || ngy >= gridRows) continue;
          for (const j of grid[ngy * gridCols + ngx]) {
            const ddx = prevRenderX[j] - xs[i];
            const ddy = prevRenderY[j] - ys[i];
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < minDist2) {
              minDist2 = d2;
              nearestX = prevRenderX[j];
              nearestY = prevRenderY[j];
              if (d2 < cellSize * cellSize) break outer;
            }
          }
        }
      }
      // Fallback: pick a random old dot if none found in nearby cells
      if (nearestX === -1) {
        const j = Math.floor(Math.random() * prevCount);
        nearestX = prevRenderX[j];
        nearestY = prevRenderY[j];
      }
      formOffsetX[i] = nearestX - xs[i];
      formOffsetY[i] = nearestY - ys[i];
    }
  } else {
    for (let i = 0; i < count; i++) {
      formOffsetX[i] = Math.random() * w - xs[i];
      formOffsetY[i] = Math.random() * h - ys[i];
    }
  }
  const renderX = new Float32Array(count);
  const renderY = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    renderX[i] = xs[i] + formOffsetX[i];
    renderY[i] = ys[i] + formOffsetY[i];
  }
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
    formOffsetX,
    formOffsetY,
    animating: true,
    count,
    mouseX: -9999,
    mouseY: -9999,
    mouseActive: false,
    shockwaves: [],
    _needsAnim: true,
    _hasDisplacement: false,
    buckets: {
      indices: Array.from({ length: 126 }, () => new Int32Array(count + 1)),
      lengths: new Int32Array(126),
    },
  };
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

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
      // Render each Voronoi dot as a circle
      ctx.beginPath();
      ctx.arc(renderX[i], renderY[i], size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DitheredText({
  text,
  width = "100%",
  height = 120,
  fontSize = 64,
  fontFamily = "sans-serif",
  fontWeight = "bold",
  pointSpacing = 6,
  dotScale = 0.75,
  invert = false,
  dither = false as DitherMode,
  dotColor = [138, 143, 152],
  shockwaveSpeed = 200,
  shockwaveWidth = 25,
  shockwaveStrength = 12,
  shockwaveDuration = 1500,
  className,
}: DitheredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<HalftoneState | null>(null);

  const swConfig = useMemo(
    () => ({ shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration }),
    [shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration]
  );

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

      if (s.mouseActive || hasShockwaves || s._hasDisplacement || s.animating) {
        const swScale = 1 + (s.shockwaves.length - 1) * 0.5;
        if (hasShockwaves) s._needsAnim = true;
        s._hasDisplacement = false;

        let formAllSettled = s.animating;

        for (let i = 0; i < s.count; i++) {
          const bx = s.baseX[i];
          const by = s.baseY[i];
          let nx = 0;
          let ny = 0;

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

          s.displaceX[i] += (nx - s.displaceX[i]) * 0.12;
          s.displaceY[i] += (ny - s.displaceY[i]) * 0.12;
          if (Math.abs(s.displaceX[i]) < 0.01) s.displaceX[i] = 0;
          if (Math.abs(s.displaceY[i]) < 0.01) s.displaceY[i] = 0;
          if (s.displaceX[i] !== 0 || s.displaceY[i] !== 0) {
            s._needsAnim = true;
            s._hasDisplacement = true;
          }

          if (s.animating) {
            s.formOffsetX[i] *= 0.85;
            s.formOffsetY[i] *= 0.85;
            if (Math.abs(s.formOffsetX[i]) > 0.5 || Math.abs(s.formOffsetY[i]) > 0.5) {
              formAllSettled = false;
            }
          }

          s.renderX[i] = bx + s.displaceX[i] + s.formOffsetX[i];
          s.renderY[i] = by + s.displaceY[i] + s.formOffsetY[i];
        }

        if (s.animating) {
          if (formAllSettled) {
            s.formOffsetX.fill(0);
            s.formOffsetY.fill(0);
            s.animating = false;
          } else {
            s._needsAnim = true;
          }
        }
      }

      const [r, g, b] = dotColorRef.current;
      drawFrame(s, r, g, b);

      rafId = s.mouseActive || s._needsAnim ? requestAnimationFrame(tick) : null;
    };

    const rebuild = () => {
      const prev = stateRef.current;
      stateRef.current = buildState(
        canvas,
        text,
        fontSize,
        fontFamily,
        fontWeight,
        pointSpacing,
        dotScale,
        invert,
        dither,
        prev?.renderX,
        prev?.renderY,
        prev?.count
      );
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    rebuild();

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

    const ro = new ResizeObserver(() => rebuild());
    if (containerRef.current) ro.observe(containerRef.current);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [text, fontSize, fontFamily, fontWeight, pointSpacing, dotScale, invert, dither, swConfig]);

  return (
    <div ref={containerRef} style={{ width, height }} className={className}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
      />
    </div>
  );
}
