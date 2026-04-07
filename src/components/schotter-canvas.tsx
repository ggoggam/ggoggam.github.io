"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 12;
const PADDING = 0.08; // fraction of canvas width

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const rand = mulberry32(seed);

  ctx.clearRect(0, 0, w, h);

  const padX = w * PADDING;
  const padY = h * PADDING;
  const availW = w - padX * 2;
  const availH = h - padY * 2;

  // Derive rows from available space so the grid fills naturally
  const cellSize = availW / COLS;
  const rows = Math.floor(availH / cellSize);

  const gridW = cellSize * COLS;
  const gridH = cellSize * rows;
  const offsetX = (w - gridW) / 2;
  const offsetY = (h - gridH) / 2;

  const squareSize = cellSize * 0.88;

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = Math.max(1, w / 600);

  for (let row = 0; row < rows; row++) {
    // Disorder increases with row — quadratic ramp like the original
    const t = row / (rows - 1);
    const disorder = t * t;

    const maxRotation = disorder * Math.PI * 0.55;
    const maxDisplace = disorder * cellSize * 0.7;

    for (let col = 0; col < COLS; col++) {
      const cx = offsetX + col * cellSize + cellSize / 2;
      const cy = offsetY + row * cellSize + cellSize / 2;

      const angle = (rand() - 0.5) * 2 * maxRotation;
      const dx = (rand() - 0.5) * 2 * maxDisplace;
      const dy = (rand() - 0.5) * 2 * maxDisplace;

      ctx.save();
      ctx.translate(cx + dx, cy + dy);
      ctx.rotate(angle);
      ctx.strokeRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
      ctx.restore();
    }
  }
}

export function SchotterCanvas({ seed: seedProp }: { seed?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed] = useState(() => seedProp ?? Math.floor(Math.random() * 2 ** 32));
  const seedRef = useRef(seed);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    draw(ctx, w, h, seedRef.current);
    ctx.restore();
  }, []);

  useEffect(() => {
    seedRef.current = seed;
    redraw();
  }, [seed, redraw]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const canvasW = Math.min(width, 500);
      const canvasH = Math.min(canvasW * 1.45, window.innerHeight * 0.6);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      draw(ctx, canvasW, canvasH, seedRef.current);
      ctx.restore();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
