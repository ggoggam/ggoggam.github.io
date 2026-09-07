import { useMemo, useState } from "react";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A deterministic SVG is visible before JavaScript and follows the page's ink.
// The drawing itself is the control; the surrounding space stays undisturbed.
export function SchotterCanvas({ seed = 1968 }: { seed?: number }) {
  const [variation, setVariation] = useState(0);
  const squares = useMemo(() => {
    const random = mulberry32(seed + variation);
    return Array.from({ length: 216 }, (_, index) => {
      const row = Math.floor(index / 12);
      const col = index % 12;
      const amount = (row / 17) ** 2;
      return {
        x: 39 + col * 22 + (random() - 0.5) * 30 * amount,
        y: 36 + row * 22 + (random() - 0.5) * 30 * amount,
        rotation: (random() - 0.5) * 150 * amount,
      };
    });
  }, [seed, variation]);

  return (
    <figure className="schotter-figure">
      <button
        type="button"
        className="art-drawing"
        aria-label="Regenerate Schotter drawing"
        title="Regenerate drawing"
        onClick={() => setVariation((current) => current + 1)}
      >
        <svg viewBox="0 0 320 448" aria-hidden="true">
          {squares.map(({ x, y, rotation }, index) => (
            <rect
              key={index}
              className="schotter-square"
              x="-9"
              y="-9"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.85"
              style={{ transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)` }}
            />
          ))}
        </svg>
      </button>
      <figcaption className="art-caption">
        <a href="https://collections.vam.ac.uk/item/O221321/schotter-print-nees-georg/">
          <cite>Schotter</cite> — Georg Nees, 1968
        </a>
      </figcaption>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Drawing variation {variation + 1}
      </span>
    </figure>
  );
}
