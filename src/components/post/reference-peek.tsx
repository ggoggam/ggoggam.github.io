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

   The pointer meets it in two stages, which is what makes the card feel earned
   rather than sprung. Arriving at the reference boxes it immediately: a hairline
   rectangle around the words, with a small paper-filled square riding the
   nearest point of that border, so the mark tracks the hand. Staying draws the
   card near the cursor, tethered back to that square by a leader line. Nothing
   about the first stage commits the reader to the second.

   What counts as arriving, for a footnote, is the whole underlined phrase and
   not just the superscript hanging off its end. The underline is the promise the
   reader can see; a 7×10px digit is not a target. Since the phrase is a Range
   over prose and not an element, there is nothing to hang a listener on — so the
   pointer is hit-tested against its rectangles instead. */

const CARD_MAX = 300;
const EDGE_PAD = 20;
const COLUMN_BREAK = 640;
/* How far off the cursor the card sits — enough that it never lands under the
   pointer, close enough that the leader stays a short run. */
const CURSOR_GAP_X = 26;
const CURSOR_GAP_Y = 22;
/* The outline stands off the glyphs rather than hugging them, or it reads as a
   highlight instead of a measurement. */
const BOX_PAD_X = 3;
const BOX_PAD_Y = 2;
const HANDLE = 7;
/* Rectangles this close on a line are the same line: it is what folds the
   superscript into the phrase it belongs to instead of boxing it separately. */
const LINE_GAP = 24;
/* Approaching counts. Without the slop the outline snaps on at the exact glyph
   edge, which reads as a twitch rather than as a response. */
const HIT_SLOP = 5;
/* A footnote is a deliberate target and opens quickly. Prose is full of links a
   pointer only crosses on its way somewhere, so those wait. */
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

/* Where the hand is. Written by one listener and read asynchronously — from a
   timer when the card opens, from a frame callback when the square moves — so
   there is no order to get wrong between the two. */
const cursor = { x: 0, y: 0, known: false };

type Source =
  | { kind: "footnote"; label: string; html: string }
  | { kind: "post"; label: string; post: PostMeta }
  | { kind: "link"; label: string; host: string; path: string };

type Peek = {
  anchor: HTMLAnchorElement;
  source: Source;
  via: "hover" | "tap";
};

type Box = { left: number; top: number; width: number; height: number };

/** A footnote marker and the words it annotates, kept together because the
    reader reaches them as one thing. */
type Target = { anchor: HTMLAnchorElement; range: Range | null };

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

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/** Text hands back one rectangle per inline fragment; a reader sees lines. Any
    two fragments that overlap vertically and sit within a word of each other are
    folded into the line they share — which is also what puts a superscript
    inside its phrase's box rather than in a box of its own. */
function mergeLines(rects: DOMRect[]): Box[] {
  const lines: Box[] = [];
  for (const r of rects) {
    if (r.width <= 0 || r.height <= 0) continue;
    const line = lines.find((l) => {
      const shared = Math.min(l.top + l.height, r.bottom) - Math.max(l.top, r.top);
      const gap = Math.max(l.left, r.left) - Math.min(l.left + l.width, r.right);
      return shared > Math.min(l.height, r.height) / 2 && gap < LINE_GAP;
    });
    if (!line) {
      lines.push({ left: r.left, top: r.top, width: r.width, height: r.height });
      continue;
    }
    const right = Math.max(line.left + line.width, r.right);
    const bottom = Math.max(line.top + line.height, r.bottom);
    line.left = Math.min(line.left, r.left);
    line.top = Math.min(line.top, r.top);
    line.width = right - line.left;
    line.height = bottom - line.top;
  }
  return lines;
}

/** One outline per line the reference occupies, standing off the glyphs. */
function outline(target: Target): Box[] {
  const rects = [
    ...(target.range ? Array.from(target.range.getClientRects()) : []),
    ...Array.from(target.anchor.getClientRects()),
  ];
  return mergeLines(rects).map((b) => ({
    left: b.left - BOX_PAD_X,
    top: b.top - BOX_PAD_Y,
    width: b.width + BOX_PAD_X * 2,
    height: b.height + BOX_PAD_Y * 2,
  }));
}

const inside = (boxes: Box[], x: number, y: number, slop = 0) =>
  boxes.some(
    (b) =>
      x >= b.left - slop &&
      x <= b.left + b.width + slop &&
      y >= b.top - slop &&
      y <= b.top + b.height + slop
  );

/** The point on the outline nearest the hand. Outside the box that is the
    clamped position; inside it, the closest edge — so the square never dives
    under the words it is marking. */
function onPerimeter(boxes: Box[], px: number, py: number) {
  let best = { x: px, y: py, d: Infinity };
  for (const b of boxes) {
    const right = b.left + b.width;
    const bottom = b.top + b.height;
    let x = clamp(px, b.left, right);
    let y = clamp(py, b.top, bottom);
    if (px > b.left && px < right && py > b.top && py < bottom) {
      const dl = px - b.left;
      const dr = right - px;
      const dt = py - b.top;
      const db = bottom - py;
      const near = Math.min(dl, dr, dt, db);
      if (near === dl) x = b.left;
      else if (near === dr) x = right;
      else if (near === dt) y = b.top;
      else y = bottom;
    }
    const d = (x - px) ** 2 + (y - py) ** 2;
    if (d < best.d) best = { x, y, d };
  }
  return best;
}

/** Where the leader lands on the card: the corner facing the square, so the
    line reads as a callout rather than as something crossing the box. */
function corner(card: Box, x: number, y: number) {
  return {
    x: x < card.left + card.width / 2 ? card.left : card.left + card.width,
    y: y < card.top + card.height / 2 ? card.top : card.top + card.height,
  };
}

/* The card's own resting point, used when there is no cursor to place it by —
   a tap, or a marker reached with the keyboard. A reference that wraps across
   lines is measured on its last one, where it actually ends. */
function anchorPoint(el: HTMLElement) {
  const rects = el.getClientRects();
  const r = rects.length ? rects[rects.length - 1] : el.getBoundingClientRect();
  return { x: r.right, y: r.top + r.height / 2 };
}

const sameBoxes = (a: Box[] | null, b: Box[]) =>
  a !== null &&
  a.length === b.length &&
  a.every(
    (x, i) =>
      x.left === b[i].left &&
      x.top === b[i].top &&
      x.width === b[i].width &&
      x.height === b[i].height
  );

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
  // The second stage. The outline is up as soon as the pointer arrives; this is
  // what the waiting buys.
  const [carded, setCarded] = useState(false);
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SVGRectElement>(null);
  const leadRef = useRef<SVGLineElement>(null);
  const peekRef = useRef<Peek | null>(null);
  const targetsRef = useRef<Target[]>([]);
  /* Hit rectangles for every footnote in the article, held until the page moves
     under them. Recomputing a Range's geometry on every pointer move would cost
     a layout per frame for no new information. */
  const zonesRef = useRef<Box[][] | null>(null);
  const focusedFor = useRef<Peek | null>(null);
  /* Where the cursor stood relative to the reference when the card opened. Kept
     as an offset, not a point, so the card rides with the line it belongs to
     when the page scrolls instead of hanging in the air. */
  const originRef = useRef({ dx: 0, dy: 0 });
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
    setCarded(false);
    setBoxes(null);
  }, []);

  const close = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(dismiss, CLOSE_DELAY);
  }, [dismiss]);

  const hold = useCallback(() => clearTimeout(closeTimer.current), []);

  /* One way in, whichever route found the reference. `delay` of zero means
     there is no hand to wait for — a tap, or a marker reached by keyboard — and
     the card goes straight up beside the words themselves. */
  const open = useCallback(
    (anchor: HTMLAnchorElement, source: Source, via: Peek["via"], delay: number) => {
      clearTimers();
      setPeek({ anchor, source, via });
      setCarded(delay === 0);
      if (delay === 0) {
        originRef.current = { dx: 0, dy: 0 };
        return;
      }
      openTimer.current = setTimeout(() => {
        const { x, y } = anchorPoint(anchor);
        originRef.current = cursor.known
          ? { dx: cursor.x - x, dy: cursor.y - y }
          : { dx: 0, dy: 0 };
        setCarded(true);
      }, delay);
    },
    []
  );

  /* Where the card goes, recomputed every frame the hand moves.

     It follows the cursor for as long as the cursor is on the reference, which
     is the whole time the reader is looking at the words rather than at the
     card. Leaving the outline stops it: the reader is on their way to the card
     by then, and a card that keeps moving is a card you cannot reach. What is
     kept between frames is the offset from the words, not the point, so the
     card also rides its own line when the page scrolls. */
  const place = useCallback(
    (boxes: Box[]): Box | null => {
      const card = cardRef.current;
      const column = containerRef.current;
      const current = peekRef.current;
      if (!card || !column || !current) return null;

      if (current.via !== "tap" && cursor.known && inside(boxes, cursor.x, cursor.y, HIT_SLOP)) {
        const on = anchorPoint(current.anchor);
        originRef.current = { dx: cursor.x - on.x, dy: cursor.y - on.y };
      }

      const col = column.getBoundingClientRect();
      // On a phone the card takes the column's measure, so its edges line up
      // with the text it interrupts rather than floating at some other width.
      const onColumn = window.innerWidth < COLUMN_BREAK;
      const width = onColumn ? col.width : Math.min(CARD_MAX, window.innerWidth - EDGE_PAD * 2);
      card.style.width = `${width}px`;
      const height = card.offsetHeight;
      const { x, y } = anchorPoint(current.anchor);

      let left: number;
      let top: number;
      if (onColumn) {
        const below = y + 20;
        left = col.left;
        top =
          below + height > window.innerHeight - EDGE_PAD
            ? Math.max(y - 20 - height, EDGE_PAD)
            : below;
      } else {
        const ox = x + originRef.current.dx;
        const oy = y + originRef.current.dy;
        left = ox + CURSOR_GAP_X;
        if (left + width > window.innerWidth - EDGE_PAD) left = ox - CURSOR_GAP_X - width;
        top = oy + CURSOR_GAP_Y;
        if (top + height > window.innerHeight - EDGE_PAD) top = oy - CURSOR_GAP_Y - height;
        left = clamp(left, EDGE_PAD, window.innerWidth - width - EDGE_PAD);
        top = clamp(top, EDGE_PAD, window.innerHeight - height - EDGE_PAD);
      }

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      return { left, top, width, height };
    },
    [containerRef]
  );

  /* The whole overlay, redrawn in one pass: the card is moved, the square is put
     on the border nearest the hand, and the leader is stretched between them.
     None of it goes through React — the card's contents would re-render sixty
     times a second for a position change — and keeping it in one callback is
     what guarantees the leader lands on the card rather than a frame behind it. */
  const draw = useCallback(() => {
    const handle = handleRef.current;
    const live = peekRef.current?.via !== "tap";
    if (!handle || !boxes?.length) return;

    const card = place(boxes);
    // With no hand to follow — a tap, a keyboard — the square parks on the
    // trailing edge of the last line, where the reference ends.
    const tail = boxes[boxes.length - 1];
    const from =
      live && cursor.known
        ? { x: cursor.x, y: cursor.y }
        : { x: tail.left + tail.width, y: tail.top + tail.height / 2 };
    const point = onPerimeter(boxes, from.x, from.y);
    handle.setAttribute("x", (point.x - HANDLE / 2).toFixed(2));
    handle.setAttribute("y", (point.y - HANDLE / 2).toFixed(2));

    const lead = leadRef.current;
    if (!lead || !card) return;
    const end = corner(card, point.x, point.y);
    lead.setAttribute("x1", point.x.toFixed(2));
    lead.setAttribute("y1", point.y.toFixed(2));
    lead.setAttribute("x2", end.x.toFixed(2));
    lead.setAttribute("y2", end.y.toFixed(2));
  }, [boxes, place]);

  /* Layout, not effect: the card mounts unpositioned, and this is what puts it
     somewhere before the browser gets a chance to paint it there. It has to be
     the parent's — React attaches refs in tree order as it runs layout effects,
     so anything nested would fire before the card's own ref exists. */
  useLayoutEffect(draw, [draw, carded]);

  useEffect(() => {
    if (!peek || peek.via === "tap") return;
    let queued = 0;
    const schedule = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(draw);
    };
    window.addEventListener("pointermove", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("pointermove", schedule);
    };
  }, [draw, peek]);

  /* One tracker for the whole article. It writes two numbers per move; the
     square and the card placement both read them later, off the event. */
  useEffect(() => {
    if (!finePointer) return;
    const track = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.known = true;
    };
    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, [finePointer]);

  /* Underline the words each footnote annotates, so a reader can see what
     carries a reference without hunting for superscripts. */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets: Target[] = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("a[data-footnote-ref]")
    )
      .filter((a) => a.hash)
      .map((anchor) => ({ anchor, range: citedPhrase(anchor.closest("sup") ?? anchor) }));
    targetsRef.current = targets;
    zonesRef.current = null;

    if (supportsHighlights()) {
      const ranges = targets.map((t) => t.range).filter((r): r is Range => r !== null);
      CSS.highlights.set(RESTING_HIGHLIGHT, new Highlight(...ranges));
    }

    return () => {
      if (supportsHighlights()) {
        CSS.highlights.delete(RESTING_HIGHLIGHT);
        CSS.highlights.delete(ACTIVE_HIGHLIGHT);
      }
      targetsRef.current = [];
      zonesRef.current = null;
    };
  }, [containerRef]);

  /* The phrase behind the open card goes to full ink, the way its marker does. */
  useEffect(() => {
    const target = peek && targetsRef.current.find((t) => t.anchor === peek.anchor);
    if (!target?.range || !supportsHighlights()) return;
    CSS.highlights.set(ACTIVE_HIGHLIGHT, new Highlight(target.range));
    return () => {
      CSS.highlights.delete(ACTIVE_HIGHLIGHT);
    };
  }, [peek]);

  /* A footnote is reached by crossing the underline, not by finding the digit.
     There is no element under those words to listen on, so the pointer is
     tested against their rectangles once a frame. */
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !finePointer) return;

    const zones = () => (zonesRef.current ??= targetsRef.current.map((t) => outline(t)));
    const forget = () => {
      zonesRef.current = null;
    };

    let queued = 0;
    const test = () => {
      const current = peekRef.current;
      if (current?.via === "tap") return;

      // Inside the card is not outside the reference. Without this the pointer
      // would move off the words, onto the card it just opened, and be read as
      // having left — closing the card out from under itself.
      const card = cardRef.current?.getBoundingClientRect();
      if (card && inside([card], cursor.x, cursor.y)) {
        hold();
        return;
      }

      const found = zones().findIndex((boxes) => inside(boxes, cursor.x, cursor.y, HIT_SLOP));

      if (found === -1) {
        // Only a footnote's own hover is this handler's to close. A link peek
        // has its own leave event, and closing it from out here would fight it.
        if (current && targetsRef.current.some((t) => t.anchor === current.anchor)) close();
        return;
      }

      const anchor = targetsRef.current[found].anchor;
      if (current?.anchor === anchor) {
        hold();
        return;
      }
      // A link inside a cited phrase would otherwise trade places with it every
      // frame, so the link keeps the pointer for exactly as long as it is under
      // the pointer, and the phrase takes over the moment it is not.
      if (
        current &&
        !targetsRef.current.some((t) => t.anchor === current.anchor) &&
        inside(mergeLines(Array.from(current.anchor.getClientRects())), cursor.x, cursor.y)
      ) {
        return;
      }
      const source = readFootnote(root, anchor);
      if (source) open(anchor, source, "hover", FOOTNOTE_DELAY);
    };

    const schedule = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(test);
    };

    window.addEventListener("pointermove", schedule, { passive: true });
    window.addEventListener("scroll", forget, { passive: true });
    window.addEventListener("resize", forget);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener("pointermove", schedule);
      window.removeEventListener("scroll", forget);
      window.removeEventListener("resize", forget);
    };
  }, [containerRef, finePointer, close, hold, open]);

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

    const enter = (event: PointerEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const source = readLink(anchor, posts);
      if (!source) return;
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      cursor.known = true;
      open(anchor, source, "hover", LINK_DELAY);
    };

    const focus = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      if (!anchor.matches(":focus-visible")) return;
      const source = readFootnote(root, anchor);
      if (source) open(anchor, source, "hover", 0);
    };

    const tap = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      if (peekRef.current?.anchor === anchor) {
        event.preventDefault();
        clearTimers();
        dismiss();
        return;
      }
      // The jump is only given up once there is something better to replace it
      // with; a reference this cannot read stays an ordinary link.
      const source = readFootnote(root, anchor);
      if (!source) return;
      event.preventDefault();
      open(anchor, source, "tap", 0);
    };

    markers.forEach((a) => {
      if (finePointer) {
        // No enter or leave of its own: the phrase around it is the target, and
        // it is hit-tested. Only footnotes open on focus — a card on every
        // tabbed link would be noise; a link already says where it goes.
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
  }, [containerRef, close, dismiss, finePointer, open, posts]);

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

  /* The outline is React's to render, so it goes through state — but it only
     moves when the page does. Scroll and resize re-measure against the live
     anchor rather than closing: a card that vanishes mid-sentence because the
     page moved two pixels is worse than one that follows. */
  useLayoutEffect(() => {
    if (!peek) return;
    const target = targetsRef.current.find((t) => t.anchor === peek.anchor) ?? {
      anchor: peek.anchor,
      range: null,
    };

    let queued = 0;
    const measure = () => {
      const next = outline(target);
      setBoxes((current) => (sameBoxes(current, next) ? current : next));
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
    if (cardRef.current) observer.observe(cardRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(queued);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [peek, carded, containerRef]);

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

  /* Focus follows a tap into the card. The plot has already placed it in the
     same layout pass that mounted it, so this cannot land on a card that is
     still at the top of the document and scroll the page away from the very
     line the reader is on. */
  useEffect(() => {
    if (!peek || peek.via !== "tap" || !carded) return;
    if (focusedFor.current === peek) return;
    focusedFor.current = peek;
    cardRef.current?.focus({ preventScroll: true });
  }, [peek, carded]);

  if (typeof document === "undefined" || !peek) return null;

  const { source } = peek;
  const tapped = peek.via === "tap";

  return createPortal(
    <div className="peek" aria-hidden={tapped ? undefined : true}>
      {boxes && (
        <svg className="peek-plot" aria-hidden="true">
          {boxes.map((b, i) => (
            <rect
              key={i}
              className="peek-box"
              x={b.left.toFixed(2)}
              y={b.top.toFixed(2)}
              width={b.width.toFixed(2)}
              height={b.height.toFixed(2)}
            />
          ))}
          {carded && <line ref={leadRef} className="peek-lead" />}
          <rect ref={handleRef} className="peek-handle" width={HANDLE} height={HANDLE} />
        </svg>
      )}

      {/* Deliberately unstyled from React: `draw` owns left, top, and width, and
          a re-render here must not stamp a stale position back over them. */}
      {carded && (
        <div
          ref={cardRef}
          className="peek-card"
          role={tapped ? "dialog" : undefined}
          aria-label={tapped ? `Reference ${source.label}` : undefined}
          tabIndex={tapped ? -1 : undefined}
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
                  <path
                    d="M1 1l9 9M10 1l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                  />
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
      )}
    </div>,
    document.body
  );
}
