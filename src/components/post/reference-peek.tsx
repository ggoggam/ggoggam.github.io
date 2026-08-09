import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { citedPhrase, supportsHighlights } from "@/lib/cited-phrase";
import { getBlogPosts, getTILPosts, type PostMeta } from "@/lib/posts";

/* Reaching a reference pulls it up beside the line that cites it, instead of
   sending the reader somewhere else to find it. Two things count as a
   reference: a footnote marker, whose text is read out of the list at the foot
   of the article, and a link, whose destination is described from what the site
   already knows. Neither is a second copy of anything — the footnote list is
   still there and still complete, and the link still goes where it always did.

   A pointer opens a card by hovering; a finger opens a footnote card by
   tapping, which is worth the hijacked marker because the jump it replaces is
   exactly what costs a phone reader their place. Links are left alone on touch:
   tapping one should go there. Because the tap route is the only way into a
   footnote on touch, that card is a real dialog — focused, labelled, closable —
   while the hover card stays `aria-hidden` decoration over a working link.

   Three placements, by the room available: out in the gutter beside the 64ch
   column, floating under the anchor, or spanning the column on a phone. */

const CARD_MAX = 300;
const CARD_MIN = 220;
const GUTTER_PAD = 28;
const EDGE_PAD = 20;
/* The readout needs a clear left margin to sit in; below this it would land on
   the prose, so it simply does not appear. */
const READOUT_ROOM = 96;
const COLUMN_BREAK = 640;
/* A footnote marker is a deliberate target and opens quickly. Prose is full of
   links a pointer only crosses on its way somewhere, so those wait. */
const FOOTNOTE_DELAY = 90;
const LINK_DELAY = 320;
const CLOSE_DELAY = 160;

const RESTING_HIGHLIGHT = "cited-phrase";
const ACTIVE_HIGHLIGHT = "cited-phrase-live";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
let pointerQuery: MediaQueryList | null = null;
const getPointerQuery = () => (pointerQuery ??= window.matchMedia(FINE_POINTER));
const subscribePointer = (onChange: () => void) => {
  const query = getPointerQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Source =
  | { kind: "footnote"; label: string; html: string }
  | { kind: "post"; label: string; post: PostMeta }
  | { kind: "link"; label: string; host: string; path: string };

type Peek = {
  anchor: HTMLAnchorElement;
  source: Source;
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
function readFootnote(root: HTMLElement, marker: HTMLAnchorElement): Source | null {
  const href = marker.hash;
  const id = decodeURIComponent(href.slice(href.indexOf("#") + 1));
  const source = root.querySelector(`[id="${CSS.escape(id)}"]`);
  if (!source) return null;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-footnote-backref]").forEach((el) => el.remove());
  return { kind: "footnote", label: marker.textContent ?? "", html: clone.innerHTML };
}

/** What a link can honestly promise before you follow it: for a post on this
    site, the post; for anywhere else, the destination, spelled out. */
function readLink(anchor: HTMLAnchorElement, posts: Map<string, PostMeta>): Source | null {
  const href = anchor.getAttribute("href") ?? "";
  if (!href || href.startsWith("#")) return null;

  if (href.startsWith("/")) {
    const post = posts.get(href.replace(/\/$/, ""));
    // An internal link that is not a post — /about, an index — describes itself
    // well enough in its own text. Only a post has anything to preview.
    return post ? { kind: "post", label: post.type, post } : null;
  }

  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      kind: "link",
      label: "external",
      host: url.host.replace(/^www\./, ""),
      path: `${url.pathname}${url.search}${url.hash}`.replace(/^\/$/, ""),
    };
  } catch {
    return null;
  }
}

/* The crosshair registers on the anchor's trailing edge rather than its centre,
   so the mark sits beside the digit instead of on top of it. A link that wraps
   across lines is measured on its last one, where it actually ends. */
function anchorPoint(el: HTMLElement) {
  const rects = el.getClientRects();
  const r = rects.length ? rects[rects.length - 1] : el.getBoundingClientRect();
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
  // anchors have to be rewired for the other interaction when it does.
  const finePointer = useSyncExternalStore(
    subscribePointer,
    () => getPointerQuery().matches,
    () => true
  );

  const posts = useMemo(
    () => new Map([...getBlogPosts(), ...getTILPosts()].map((p) => [p.url, p])),
    []
  );
  const [peek, setPeek] = useState<Peek | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<Peek | null>(null);
  const phrasesRef = useRef(new Map<HTMLElement, Range>());
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
    // Hand focus back to the anchor, but only if it is ours to hand back —
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

  /* Underline the words each footnote annotates, so a reader can see what
     carries a reference without hunting for superscripts. */
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !supportsHighlights()) return;

    const phrases = phrasesRef.current;
    phrases.clear();
    root.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]").forEach((marker) => {
      const range = citedPhrase(marker.closest("sup") ?? marker);
      if (range) phrases.set(marker, range);
    });
    CSS.highlights.set(RESTING_HIGHLIGHT, new Highlight(...phrases.values()));

    return () => {
      CSS.highlights.delete(RESTING_HIGHLIGHT);
      CSS.highlights.delete(ACTIVE_HIGHLIGHT);
      phrases.clear();
    };
  }, [containerRef]);

  /* The phrase behind the open card goes to full ink, the way its marker does. */
  useEffect(() => {
    const range = peek && phrasesRef.current.get(peek.anchor);
    if (!range || !supportsHighlights()) return;
    CSS.highlights.set(ACTIVE_HIGHLIGHT, new Highlight(range));
    return () => {
      CSS.highlights.delete(ACTIVE_HIGHLIGHT);
    };
  }, [peek]);

  /* Wire every anchor in the article, one way or the other. */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const markers = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]")
    ).filter((a) => a.hash);

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(".prose a[href]")).filter(
      (a) =>
        !a.hasAttribute("data-footnote-ref") &&
        !a.hasAttribute("data-footnote-backref") &&
        // The self-link on a heading points at the heading it is already in.
        !a.closest("h1, h2, h3, h4, h5, h6")
    );

    const show = (anchor: HTMLAnchorElement, source: Source | null, via: Peek["via"]) => {
      if (!source) return false;
      setPeek({ anchor, source, via });
      return true;
    };

    const enter = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const footnote = anchor.hasAttribute("data-footnote-ref");
      clearTimers();
      openTimer.current = setTimeout(
        () =>
          show(anchor, footnote ? readFootnote(root, anchor) : readLink(anchor, posts), "hover"),
        footnote ? FOOTNOTE_DELAY : LINK_DELAY
      );
    };

    const focus = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      if (!anchor.matches(":focus-visible")) return;
      clearTimers();
      show(anchor, readFootnote(root, anchor), "hover");
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
      if (show(anchor, readFootnote(root, anchor), "tap")) event.preventDefault();
    };

    markers.forEach((a) => {
      if (finePointer) {
        a.addEventListener("pointerenter", enter);
        a.addEventListener("pointerleave", close);
        // Only footnotes open on focus. A card on every tabbed link would be
        // noise; a link already says where it goes.
        a.addEventListener("focus", focus);
        a.addEventListener("blur", close);
      } else {
        a.addEventListener("click", tap);
      }
    });

    // Links keep their own behaviour on touch — tapping one should go there.
    if (finePointer) {
      links.forEach((a) => {
        a.addEventListener("pointerenter", enter);
        a.addEventListener("pointerleave", close);
      });
    }

    return () => {
      clearTimers();
      [...markers, ...links].forEach((a) => {
        a.removeEventListener("pointerenter", enter);
        a.removeEventListener("pointerleave", close);
        a.removeEventListener("focus", focus);
        a.removeEventListener("blur", close);
        a.removeEventListener("click", tap);
      });
    };
  }, [containerRef, close, dismiss, finePointer, posts]);

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

  /* Marks the live anchor so it can hold full ink while its card is open, and
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

  const { source } = peek;
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
        aria-label={tapped ? `Reference ${source.label}` : undefined}
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
          <span className="peek-index label">{source.label}</span>
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

        {source.kind === "footnote" && (
          <div className="peek-body prose" dangerouslySetInnerHTML={{ __html: source.html }} />
        )}

        {source.kind === "post" && (
          <div className="peek-body">
            <span className="peek-title title-display">{source.post.title}</span>
            <time className="peek-date label" dateTime={source.post.date}>
              {source.post.date}
            </time>
            {source.post.excerpt && <p className="peek-excerpt">{source.post.excerpt}</p>}
          </div>
        )}

        {source.kind === "link" && (
          <div className="peek-body">
            <span className="peek-host">{source.host}</span>
            {source.path && <span className="peek-path">{source.path}</span>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
