import { ArtFigure } from "@/components/art-figure";
import { mulberry32 } from "@/lib/generative-art";

function drawDrift(seed: number) {
  const random = mulberry32(seed);
  const phase = random() * Math.PI * 2;
  const bend = 1.4 + random() * 1.2;

  return Array.from({ length: 336 }, (_, index) => {
    const row = Math.floor(index / 14);
    const col = index % 14;
    const amount = (row / 23) ** 1.5;
    const angle =
      Math.sin(col * 0.3 + row * 0.16 + phase) * bend * amount + (random() - 0.5) * 0.7 * amount;

    return (
      <line
        key={index}
        className="art-mark"
        x1="0"
        y1="-7"
        x2="0"
        y2="7"
        stroke="currentColor"
        strokeWidth="0.9"
        style={{
          transform: `translate(${43 + col * 18}px, ${40 + row * 16}px) rotate(${(angle * 180) / Math.PI}deg)`,
        }}
      />
    );
  });
}

function drawOrbits(seed: number) {
  const random = mulberry32(seed);
  const phase = random() * Math.PI * 2;

  return Array.from({ length: 63 }, (_, index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const amount = (row / 8) ** 1.8;
    const driftX = (Math.sin(col * 0.8 + phase) * 6 + (random() - 0.5) * 12) * amount;
    const driftY = (random() - 0.5) * 18 * amount;

    return (
      <g key={index} fill="none" stroke="currentColor" strokeWidth="0.7">
        {[0, 1, 2].map((ring) => (
          <circle
            key={ring}
            className="art-mark"
            r={4 + ring * 4.5}
            style={{
              transform: `translate(${46 + col * 38 + driftX * ring}px, ${52 + row * 43 + driftY * ring}px)`,
            }}
          />
        ))}
      </g>
    );
  });
}

function drawFaults(seed: number) {
  const random = mulberry32(seed);
  const phase = random() * Math.PI * 2;
  // Each row splits along one wandering seam. Displacement grows downward.
  return Array.from({ length: 48 }, (_, row) => {
    const y = 38 + row * 7.8;
    const amount = (row / 47) ** 1.6;
    const seam = 160 + Math.sin(row * 0.13 + phase) * 20;
    const gap = 2 + amount * (8 + random() * 17);
    const shift = (4 + random() * 10) * amount;
    const rotation = (random() - 0.5) * 8 * amount;

    return (
      <g key={row} fill="none" stroke="currentColor" strokeWidth="0.8">
        <line
          className="art-mark"
          x1="-105"
          x2="0"
          style={{
            transform: `translate(${seam - gap / 2}px, ${y - shift}px) rotate(${-rotation}deg)`,
          }}
        />
        <line
          className="art-mark"
          x1="0"
          x2="105"
          style={{
            transform: `translate(${seam + gap / 2}px, ${y + shift}px) rotate(${rotation}deg)`,
          }}
        />
      </g>
    );
  });
}

export function DriftCanvas() {
  return (
    <ArtFigure
      title="Drift"
      description="Upright strokes gradually turn into a flowing field of currents."
      caption={<cite>Drift</cite>}
      seed={2718}
      draw={drawDrift}
    />
  );
}

export function OrbitsCanvas() {
  return (
    <ArtFigure
      title="Orbits"
      description="An ordered grid of concentric circles drifts apart into overlapping rings."
      caption={<cite>Orbits</cite>}
      seed={3141}
      draw={drawOrbits}
    />
  );
}

export function FaultsCanvas() {
  return (
    <ArtFigure
      title="Faults"
      description="Parallel horizontal lines split along a wandering seam, gradually shifting out of alignment."
      caption={<cite>Faults</cite>}
      seed={1618}
      draw={drawFaults}
    />
  );
}
