import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

/* Reaching a footnote pulls the reference itself up beside the line it belongs
   to, instead of throwing the reader to the bottom of the article. The footnote
   list down there is still the source of truth — this reads from it — so nothing
   here changes what a reader without JavaScript gets. It is a shortcut, not a
   second copy.

   A pointer opens it by hovering; a finger opens it by tapping, which is worth
   the hijacked link because the jump it replaces is exactly the thing that costs
   a phone reader their place. Because the tap route is the only way in on touch,
   that card is a real dialog — focused, labelled, closable — while the hover
   card stays `aria-hidden` decoration over a link that already works.

   Three placements, by the room available: out in the gutter beside the 64ch
   column, floating under the marker, or spanning the column on a phone. */

const CARD_MAX = 300;
const CARD_MIN = 220;
const GUTTER_PAD = 28;
const EDGE_PAD = 20;
/* The readout needs a clear left margin to sit in; below this it would land on
   the prose, so it simply does not appear. */
const READOUT_ROOM = 96;
const COLUMN_BREAK = 640;
const OPEN_DELAY = 90;
const CLOSE_DELAY = 160;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
let pointerQuery: MediaQueryList | null = null;
const getPointerQuery = () => (pointerQuery ??= window.matchMedia(FINE_POINTER));
const subscribePointer = (onChange: () => void) => {
  const query = getPointerQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Peek = {
  anchor: HTMLAnchorElement;
  html: string;
  index: string;
  via: "hover" | "tap";
};

/** Everything measured: where the crosshair crosses, and where the card lands. */
type Frame = {
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  readout: boolean;
};

/** The footnote's own text, minus the ↩ backref, which is meaningless here. */
function readFootnote(root: HTMLElement, href: string): string | null {
  const id = decodeURIComponent(href.slice(href.indexOf("#") + 1));
  const source = root.querySelector(`[id="${CSS.escape(id)}"]`);
  if (!source) return null;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-footnote-backref]").forEach((el) => el.remove());
  return clone.innerHTML;
}

/* The crosshair registers on the marker's trailing edge rather than its centre,
   so the mark sits beside the digit instead of on top of it. */
function anchorPoint(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.right, y: r.top + r.height / 2 };
}

function same(a: Frame | null, b: Frame) {
  return (
    a !== null &&
    a.x === b.x &&
    a.y === b.y &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.readout === b.readout
  );
}

export default function ReferencePeek({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  // Not a one-off read: a tablet gains and loses a trackpad mid-session, and the
  // markers have to be rewired for the other interaction when it does.
  const finePointer = useSyncExternalStore(
    subscribePointer,
    () => getPointerQuery().matches,
    () => true
  );

  const [peek, setPeek] = useState<Peek | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<Peek | null>(null);
  const focusedFor = useRef<Peek | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    peekRef.current = peek;
  }, [peek]);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const dismiss = useCallback(() => {
    const current = peekRef.current;
    // Hand focus back to the marker, but only if it is ours to hand back —
    // a tap somewhere else has already moved it on purpose.
    if (current?.via === "tap" && cardRef.current?.contains(document.activeElement)) {
      current.anchor.focus({ preventScroll: true });
    }
    setPeek(null);
    setFrame(null);
  }, []);

  const close = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(dismiss, CLOSE_DELAY);
  }, [dismiss]);

  const hold = useCallback(() => clearTimeout(closeTimer.current), []);

  /* Wire every footnote marker in the article, one way or the other. */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const markers = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]")
    ).filter((a) => a.hash);

    const read = (anchor: HTMLAnchorElement, via: Peek["via"]) => {
      const html = readFootnote(root, anchor.hash);
      if (!html) return false;
      setPeek({ anchor, html, index: anchor.textContent ?? "", via });
      return true;
    };

    const enter = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      clearTimers();
      openTimer.current = setTimeout(() => read(anchor, "hover"), OPEN_DELAY);
    };

    const focus = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      if (!anchor.matches(":focus-visible")) return;
      clearTimers();
      read(anchor, "hover");
    };

    const tap = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      if (peekRef.current?.anchor === anchor) {
        event.preventDefault();
        clearTimers();
        dismiss();
        return;
      }
      clearTimers();
      // The jump is only given up once there is something better to replace it
      // with; a reference this cannot read stays an ordinary link.
      if (read(anchor, "tap")) event.preventDefault();
    };

    markers.forEach((a) => {
      if (finePointer) {
        a.addEventListener("pointerenter", enter);
        a.addEventListener("pointerleave", close);
        a.addEventListener("focus", focus);
        a.addEventListener("blur", close);
      } else {
        a.addEventListener("click", tap);
      }
    });

    return () => {
      clearTimers();
      markers.forEach((a) => {
        a.removeEventListener("pointerenter", enter);
        a.removeEventListener("pointerleave", close);
        a.removeEventListener("focus", focus);
        a.removeEventListener("blur", close);
        a.removeEventListener("click", tap);
      });
    };
  }, [containerRef, close, dismiss, finePointer]);

  /* Escape closes, the way any transient overlay should. A tap-opened card also
     closes on a tap outside it, since there is no pointer to simply leave. */
  useEffect(() => {
    if (!peek) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      clearTimers();
      dismiss();
    };
    window.addEventListener("keydown", onKey);

    if (peek.via !== "tap") return () => window.removeEventListener("keydown", onKey);

    const onOutside = (e: Event) => {
      const target = e.target as Node;
      if (cardRef.current?.contains(target) || peek.anchor.contains(target)) return;
      clearTimers();
      dismiss();
    };
    document.addEventListener("pointerdown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [peek, dismiss]);

  /* Placement needs the card's own height, so it is measured after layout and
     clamped into the viewport. Scroll and resize re-measure against the live
     anchor rather than closing — a card that vanishes mid-sentence because the
     page moved two pixels is worse than one that follows. */
  useLayoutEffect(() => {
    const column = containerRef.current;
    const card = cardRef.current;
    if (!peek || !column || !card) return;

    let queued = 0;
    const measure = () => {
      const col = column.getBoundingClientRect();
      const { x, y } = anchorPoint(peek.anchor);
      const height = card.offsetHeight;
      const gutter = window.innerWidth - col.right;
      const inGutter = Math.min(CARD_MAX, gutter - GUTTER_PAD * 2);
      const readout = col.left >= READOUT_ROOM;

      let next: Frame;
      if (inGutter >= CARD_MIN) {
        const maxTop = Math.max(window.innerHeight - height - EDGE_PAD, EDGE_PAD);
        next = {
          x,
          y,
          readout,
          left: col.right + GUTTER_PAD,
          top: Math.min(Math.max(y - 22, EDGE_PAD), maxTop),
          width: inGutter,
        };
      } else {
        // On a phone the card takes the measure itself, so its edges line up
        // with the text it interrupts rather than floating at some other width.
        const onColumn = window.innerWidth < COLUMN_BREAK;
        const width = onColumn ? col.width : Math.min(CARD_MAX, window.innerWidth - EDGE_PAD * 2);
        const left = onColumn
          ? col.left
          : Math.min(Math.max(x - width / 2, EDGE_PAD), window.innerWidth - width - EDGE_PAD);
        const below = y + 20;
        next = {
          x,
          y,
          readout,
          left,
          width,
          top:
            below + height > window.innerHeight - EDGE_PAD
              ? Math.max(y - 20 - height, EDGE_PAD)
              : below,
        };
      }

      setFrame((current) => (same(current, next) ? current : next));
    };

    measure();

    const schedule = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(measure);
    };
    // A reference that carries a plate grows once the image decodes, which is
    // after the first measurement — so watch the card, not just the window, or
    // a tall card hangs off the bottom of the screen.
    const observer = new ResizeObserver(schedule);
    observer.observe(card);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(queued);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [peek, containerRef]);

  /* Marks the live marker so it can hold full ink while its card is open, and
     says so to anything reading the page rather than looking at it. */
  useEffect(() => {
    const anchor = peek?.anchor;
    if (!anchor) return;
    anchor.setAttribute("data-peek-open", "true");
    if (peek.via === "tap") anchor.setAttribute("aria-expanded", "true");
    return () => {
      anchor.removeAttribute("data-peek-open");
      anchor.removeAttribute("aria-expanded");
    };
  }, [peek]);

  /* Focus follows a tap into the card, but only once it has been placed — the
     card is parked offscreen until then, and focusing it there would scroll the
     page away from the very line the reader is on. */
  useEffect(() => {
    if (!peek || peek.via !== "tap" || !frame) return;
    if (focusedFor.current === peek) return;
    focusedFor.current = peek;
    cardRef.current?.focus({ preventScroll: true });
  }, [peek, frame]);

  if (typeof document === "undefined" || !peek) return null;

  const tapped = peek.via === "tap";

  return createPortal(
    <div className="peek" aria-hidden={tapped ? undefined : true}>
      {frame && (
        <>
          {/* Technical-drawing crosshair: two hairlines and a register mark on
              the word itself, with the reading called out in the mono voice at
              the far end of the leader line, where no prose can collide. */}
          <div className="peek-cross" style={{ top: `${frame.y}px` }} />
          <div className="peek-cross peek-cross--v" style={{ left: `${frame.x}px` }} />
          <div className="peek-mark" style={{ left: `${frame.x}px`, top: `${frame.y}px` }} />
          {frame.readout && (
            <span className="peek-readout" style={{ top: `${frame.y}px` }}>
              {Math.round(frame.x)}, {Math.round(frame.y)}
            </span>
          )}
        </>
      )}

      <div
        ref={cardRef}
        className="peek-card"
        role={tapped ? "dialog" : undefined}
        aria-label={tapped ? `Reference ${peek.index}` : undefined}
        tabIndex={tapped ? -1 : undefined}
        style={{
          left: frame ? `${frame.left}px` : "-9999px",
          top: frame ? `${frame.top}px` : "0px",
          width: `${frame?.width ?? CARD_MAX}px`,
        }}
        onPointerEnter={tapped ? undefined : hold}
        onPointerLeave={tapped ? undefined : close}
      >
        <div className="peek-head">
          <span className="peek-index label">{peek.index}</span>
          {tapped && (
            <button
              type="button"
              className="peek-close"
              onClick={dismiss}
              aria-label="Close reference"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
                <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </button>
          )}
        </div>
        <div className="peek-body prose" dangerouslySetInnerHTML={{ __html: peek.html }} />
      </div>
    </div>,
    document.body
  );
}
