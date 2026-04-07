"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_MATRIX = [
  [4, -1, 0],
  [-1, 3, -1],
  [0, -1, 2],
];

// Muted palette consistent with the blog's gray-based minimalist style
const COLORS = [
  "rgba(220, 38, 38, 0.35)",
  "rgba(22, 163, 74, 0.35)",
  "rgba(37, 99, 235, 0.35)",
  "rgba(161, 98, 7, 0.35)",
  "rgba(126, 34, 206, 0.35)",
  "rgba(194, 65, 12, 0.35)",
];

const STROKE_COLORS = [
  "rgba(220, 38, 38, 0.8)",
  "rgba(22, 163, 74, 0.8)",
  "rgba(37, 99, 235, 0.8)",
  "rgba(161, 98, 7, 0.8)",
  "rgba(126, 34, 206, 0.8)",
  "rgba(194, 65, 12, 0.8)",
];

function computeGershgorinCircles(m: number[][]) {
  return m.map((row, i) => {
    const center = row[i];
    const radius = row.reduce((sum, val, j) => (i !== j ? sum + Math.abs(val) : sum), 0);
    return { center, radius };
  });
}

function draw(canvas: HTMLCanvasElement, m: number[][]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const originX = size / 2;
  const originY = size / 2;

  const circles = computeGershgorinCircles(m);
  const maxExtent = circles.reduce((max, c) => Math.max(max, Math.abs(c.center) + c.radius), 1);
  const scale = size / 2 / (maxExtent * 1.2);

  ctx.clearRect(0, 0, size, size);

  function toCanvasCoord(x: number, y: number) {
    return { x: originX + x * scale, y: originY - y * scale };
  }

  // Axes — gray-300
  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(size, originY);
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, size);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.stroke();

  const fontSize = Math.round(size / 40);

  circles.forEach((circle, index) => {
    const centerCoord = toCanvasCoord(circle.center, 0);
    ctx.beginPath();
    ctx.arc(centerCoord.x, centerCoord.y, circle.radius * scale, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = STROKE_COLORS[index % STROKE_COLORS.length];
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center dot — gray-600
    ctx.beginPath();
    ctx.arc(centerCoord.x, centerCoord.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#4b5563";
    ctx.fill();

    // Label — gray-700, Geist Mono
    ctx.fillStyle = "#374151";
    ctx.font = `${fontSize}px "Geist Mono", monospace`;
    ctx.fillText(String(circle.center), centerCoord.x + 6, centerCoord.y - 6);
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
    if (canvas) draw(canvas, matrixRef.current);
  }, []);

  useEffect(() => {
    matrixRef.current = matrix;
    redraw();
  }, [matrix, redraw]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const size = Math.min(width, 600);
      canvas.width = size;
      canvas.height = size;
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
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm font-geist-mono bg-gray-50 focus:outline-none focus:ring-1 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-300 text-red-700"
              : "border-gray-200 focus:ring-gray-300 text-gray-800"
          }`}
          spellCheck={false}
        />
        {error && <p className="text-xs text-red-400 font-geist-mono">{error}</p>}
      </div>

      <div ref={containerRef} className="w-full flex justify-center">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
