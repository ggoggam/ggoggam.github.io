import { useState } from "react";
import { SchotterCanvas } from "@/components/schotter-canvas";
import { DriftCanvas, OrbitsCanvas, FaultsCanvas } from "@/components/generative-studies";

const PIECES = [
  { title: "Schotter", Drawing: SchotterCanvas },
  { title: "Drift", Drawing: DriftCanvas },
  { title: "Orbits", Drawing: OrbitsCanvas },
  { title: "Faults", Drawing: FaultsCanvas },
];

export function ArtGallery() {
  const [selected, setSelected] = useState(0);

  function browse(direction: number) {
    setSelected((current) => (current + direction + PIECES.length) % PIECES.length);
  }

  return (
    <section className="home-gallery" aria-label="Generative drawings">
      {/* Keep each variation when browsing, and prerender every drawing. */}
      {PIECES.map(({ title, Drawing }, index) => (
        <div key={title} className="art-gallery-piece" hidden={selected !== index}>
          <Drawing />
        </div>
      ))}
      <div className="art-gallery-controls" role="group" aria-label="Browse drawings">
        <button type="button" onClick={() => browse(-1)} aria-label="Previous drawing">
          <span aria-hidden="true">←</span> previous
        </button>
        <button type="button" onClick={() => browse(1)} aria-label="Next drawing">
          next <span aria-hidden="true">→</span>
        </button>
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {PIECES[selected].title}, drawing {selected + 1} of {PIECES.length}
      </span>
    </section>
  );
}
