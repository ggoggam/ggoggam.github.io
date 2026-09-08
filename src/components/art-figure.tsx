import { useId, useMemo, useState, type ReactNode } from "react";

export function ArtFigure({
  title,
  description,
  caption,
  seed,
  draw,
}: {
  title: string;
  description: string;
  caption: ReactNode;
  seed: number;
  draw: (seed: number) => ReactNode;
}) {
  const [variation, setVariation] = useState(0);
  const descriptionId = useId();
  const drawing = useMemo(() => draw(seed + variation), [draw, seed, variation]);

  return (
    <figure className="art-figure">
      <button
        type="button"
        className="art-drawing"
        aria-label={`Regenerate ${title} drawing`}
        aria-describedby={descriptionId}
        title="Regenerate drawing"
        onClick={() => setVariation((current) => current + 1)}
      >
        <svg viewBox="0 0 320 448" aria-hidden="true">
          {drawing}
        </svg>
      </button>
      <figcaption className="art-caption">{caption}</figcaption>
      <span id={descriptionId} className="sr-only">
        {description}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {title}, drawing variation {variation + 1}
      </span>
    </figure>
  );
}
