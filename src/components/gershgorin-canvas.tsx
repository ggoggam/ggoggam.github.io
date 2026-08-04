"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useThemeChange } from "@/lib/theme";

const DEFAULT_MATRIX = [
  [4, -1, 0],
  [-1, 3, -1],
  [0, -1, 2],
];

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** `#rrggbb` (or a 3-digit hex) to `rgba(...)` so canvas can use the ink token. */
function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function computeGershgorinCircles(m: number[][]) {
  return m.map((row, i) => {
    const center = row[i];
    const radius = row.reduce((sum, val, j) => (i !== j ? sum + Math.abs(val) : sum), 0);
    return { center, radius };
  });
}

/**
 * Frames the plot on the discs themselves rather than on the origin. A matrix
 * with all-positive diagonal entries otherwise leaves the whole left half of the
 * canvas empty. The origin is kept in view so the axes still mean something, and
 * x and y share one scale so the discs stay circular.
 */
function viewport(width: number, m: number[][]) {
  const circles = computeGershgorinCircles(m);
  const lo = Math.min(0, ...circles.map((c) => c.center - c.radius));
  const hi = Math.max(0, ...circles.map((c) => c.center + c.radius));
  const span = Math.max(hi - lo, 1e-6);
  const scale = (width * 0.88) / span;
  const maxRadius = circles.reduce((max, c) => Math.max(max, c.radius), 0);
  const height = Math.round(
    Math.min(width, Math.max(width * 0.34, maxRadius * scale * 2 + width * 0.12))
  );
  // Canvas x of the complex origin, given the data is centred in the frame.
  const originX = width / 2 - ((lo + hi) / 2) * scale;
  return { circles, scale, height, originX };
}

export function plotHeight(width: number, m: number[][]) {
  return viewport(width, m).height;
}

function draw(canvas: HTMLCanvasElement, m: number[][]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const { circles, scale, originX } = viewport(w, m);
  const originY = h / 2;

  ctx.clearRect(0, 0, w, h);

  function toCanvasCoord(x: number, y: number) {
    return { x: originX + x * scale, y: originY - y * scale };
  }

  const ink = token("--ink", "#111111");

  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(w, originY);
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, h);
  ctx.strokeStyle = token("--rule-strong", "#c9c9c6");
  ctx.lineWidth = 1;
  ctx.stroke();

  const fontSize = Math.round(w / 28);

  // Red, blue, black — the Swiss poster set. Tints stay light so overlaps read
  // as a legible third value instead of going muddy, and identity is carried by
  // the outline, which is drawn at full strength.
  const inks = [
    token("--plot-1", "#d93a1e"),
    token("--plot-2", "#1d4ed8"),
    token("--plot-3", "#111111"),
  ];
  const blend = token("--plot-blend", "multiply") as GlobalCompositeOperation;

  ctx.save();
  ctx.globalCompositeOperation = blend;
  circles.forEach((circle, i) => {
    const c = toCanvasCoord(circle.center, 0);
    ctx.beginPath();
    ctx.arc(c.x, c.y, circle.radius * scale, 0, 2 * Math.PI);
    ctx.fillStyle = alpha(inks[i % inks.length], 0.12);
    ctx.fill();
  });
  ctx.restore();

  circles.forEach((circle, i) => {
    const c = toCanvasCoord(circle.center, 0);
    ctx.beginPath();
    ctx.arc(c.x, c.y, circle.radius * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = inks[i % inks.length];
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Centres and labels ride above every disc so no wash sits on top of them.
  ctx.font = `${fontSize}px "Spline Sans Mono", ui-monospace, monospace`;
  ctx.textBaseline = "alphabetic";
  circles.forEach((circle) => {
    const c = toCanvasCoord(circle.center, 0);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = ink;
    ctx.fill();

    // A paper-coloured halo rather than a knocked-out box: it keeps the number
    // legible over stacked inks without stamping a rectangle into the artwork.
    const label = String(circle.center);
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = token("--paper", "#fbfbfb");
    ctx.strokeText(label, c.x + 6, c.y - 8);
    ctx.fillStyle = ink;
    ctx.fillText(label, c.x + 6, c.y - 8);
  });
}

function parseMatrix(input: string): number[][] | null {
  try {
    const parsed = JSON.parse(input);
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (row) =>
          Array.isArray(row) &&
          row.length === parsed.length &&
          row.every((v) => typeof v === "number" && isFinite(v))
      )
    )
      return null;
    return parsed as number[][];
  } catch {
    return null;
  }
}

export function GershgorinCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<number[][]>(DEFAULT_MATRIX);

  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);
  const [input, setInput] = useState(JSON.stringify(DEFAULT_MATRIX));
  const [error, setError] = useState<string | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width) return;
    // A new matrix can change the largest radius, so the box is resized too.
    canvas.height = plotHeight(canvas.width, matrixRef.current);
    draw(canvas, matrixRef.current);
  }, []);

  useEffect(() => {
    matrixRef.current = matrix;
    redraw();
  }, [matrix, redraw]);

  // Redraw when the theme changes so the plot follows the ink token.
  useThemeChange(redraw);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const width = Math.min(entries[0].contentRect.width, 600);
      canvas.width = width;
      canvas.height = plotHeight(width, matrixRef.current);
      draw(canvas, matrixRef.current);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function handleInput(value: string) {
    setInput(value);
    const parsed = parseMatrix(value);
    if (!parsed) {
      setError("Must be a square JSON array of numbers, e.g. [[1,2],[3,4]]");
    } else {
      setError(null);
      setMatrix(parsed);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="gershgorin-matrix" className="label text-2xs">
          matrix
        </label>
        <input
          id="gershgorin-matrix"
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "gershgorin-error" : undefined}
          className={`w-full rounded-sm border bg-paper-sunk px-3 py-2 font-mono text-sm text-ink transition-colors ${
            error ? "border-accent" : "border-rule"
          }`}
          spellCheck={false}
        />
        {error && (
          <p id="gershgorin-error" role="alert" className="font-mono text-xs text-accent">
            {error}
          </p>
        )}
      </div>

      <div ref={containerRef} className="flex w-full justify-center">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
