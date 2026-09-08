import { ArtFigure } from "@/components/art-figure";
import { mulberry32 } from "@/lib/generative-art";

function drawSchotter(seed: number) {
  const random = mulberry32(seed);
  return Array.from({ length: 216 }, (_, index) => {
    const row = Math.floor(index / 12);
    const col = index % 12;
    const amount = (row / 17) ** 2;
    const x = 39 + col * 22 + (random() - 0.5) * 30 * amount;
    const y = 36 + row * 22 + (random() - 0.5) * 30 * amount;
    const rotation = (random() - 0.5) * 150 * amount;

    return (
      <rect
        key={index}
        className="art-mark"
        x="-9"
        y="-9"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.85"
        style={{ transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)` }}
      />
    );
  });
}

export function SchotterCanvas({ seed = 1968 }: { seed?: number }) {
  return (
    <ArtFigure
      title="Schotter"
      description="A grid of squares gradually loses its order, tumbling and scattering toward the bottom."
      seed={seed}
      draw={drawSchotter}
      caption={
        <a href="https://collections.vam.ac.uk/item/O221321/schotter-print-nees-georg/">
          <cite>Schotter</cite> — Georg Nees, 1968
        </a>
      }
    />
  );
}
