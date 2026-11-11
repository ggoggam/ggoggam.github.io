import { useEffect, useRef, useState, type HTMLAttributes } from "react";

type Read = { textContent: string | null };
type Handle = { set(value: number): void; destroy(): void };
type Figure = {
  name: string;
  means: string;
  range: [number, number, number];
  mount(host: { stage: HTMLElement; svg: SVGSVGElement; read: Read }, value: number): Handle;
};
type Kernel = {
  inject(root: Document): void;
  mk(tag: string, attrs: Record<string, string>, parent: Element): SVGSVGElement;
};

// src/hairline/ holds the kernel and the figures exactly as the hairline skill writes them;
// vite.config.ts (hairlineModulesPlugin) turns them into modules. Both load only on the client,
// and only for the figure that was picked.
const kernels = import.meta.glob<{ default: Kernel }>("../hairline/kernel.js");
const figures = import.meta.glob<{
  default: (HL: Kernel, hairline: (figure: Figure) => void) => void;
}>("../hairline/figures/*.js");

async function load(name: string) {
  const [{ default: HL }, { default: define }] = await Promise.all([
    kernels["../hairline/kernel.js"](),
    figures[`../hairline/figures/${name}.js`](),
  ]);
  let figure: Figure | null = null;
  define(HL, (declared) => {
    figure = declared;
  });
  if (!figure) throw new Error(`hairline: ${name} declared no figure`);
  return { HL, figure: figure as Figure };
}

/**
 * One hairline figure, mounted the way the skill's bench mounts it: the stage and its svg go
 * to the figure, its read-out goes to onRead, and the slider stays at its middle value.
 */
export function HairlineFigure({
  name,
  title,
  active,
  onRead,
  stageProps,
}: {
  name: string;
  title: string;
  active: boolean;
  /** Called with the figure's read-out: `rest`, or the name of what is under the pointer. */
  onRead?: (text: string) => void;
  stageProps?: HTMLAttributes<HTMLDivElement>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [means, setMeans] = useState<string | null>(null);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!active || !stage) return;
    let cancelled = false;
    let teardown = () => {};

    load(name).then(({ HL, figure }) => {
      if (cancelled) return;
      HL.inject(document);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      // The figure writes its read-out here; it goes to onRead, not to the page.
      let text: string | null = null;
      const read: Read = {
        get textContent() {
          return text;
        },
        set textContent(value) {
          text = value == null ? "" : String(value);
          onReadRef.current?.(text);
        },
      };
      const handle = figure.mount({ stage, svg, read }, figure.range[1]);
      setMeans(figure.means);
      teardown = () => {
        handle.destroy();
        svg.remove();
      };
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [name, active]);

  return (
    <div
      {...stageProps}
      ref={stageRef}
      className="hairline-stage"
      data-hairline={name}
      role="img"
      aria-label={means ?? title}
    />
  );
}
