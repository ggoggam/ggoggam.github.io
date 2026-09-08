import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { citedPhrase, supportsHighlights } from "@/lib/cited-phrase";
import { describeLink, type LinkPreview } from "@/lib/link-preview";

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
   rectangle around the words, with a small paper-filled square riding that
   border under the hand. Staying draws the card beside the cursor, tethered back
   to the square by a leader line. The card then stays put so the reader can
   reach it without chasing it. Nothing about the first stage commits the reader to
   the second, and both stages fade rather than blink — which is why a dismissed
   peek is held mounted for the length of its own fade.

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
/* A little forgiveness at either edge. The corridor between reference and
   card is handled separately, without keeping unrelated prose active. */
const KEEP_SLOP = 8;
/* Long enough to read as a fade, short enough that a card on its way out never
   stands between the reader and the one they are opening next. Matches the
   transition in globals.css. */
const FADE = 80;
/* A footnote is a deliberate target and opens quickly. Prose is full of links a
   pointer only crosses on its way somewhere, so those wait. */
const FOOTNOTE_DELAY = 70;
const LINK_DELAY = 140;
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

type Source = { kind: "footnote"; label: string; html: string } | LinkPreview;

type Peek = {
  /** What the card is placed against: a footnote marker, a link, or on touch
      the asterisk that stands in for hovering one. */
  anchor: HTMLElement;
  source: Source;
  via: "hover" | "tap";
};

type Box = { left: number; top: number; width: number; height: number };

/** A footnote marker and the words it annotates, kept together because the
    reader reaches them as one thing. An open card is also outlined this way,
    and its anchor may be the asterisk beside a link rather than a marker, so
    this is the wider element type. */
type Target = { anchor: HTMLElement; range: Range | null };

/** The footnote's own text, minus the ↩ backref, which is meaningless here.
    Takes the href off the attribute rather than `.hash`, so a marker only has
    to be an element that points somewhere, not specifically an anchor. */
function readFootnote(root: HTMLElement, marker: HTMLElement): Source | null {
  const href = marker.getAttribute("href") ?? "";
  if (!href.includes("#")) return null;
  const id = decodeURIComponent(href.slice(href.indexOf("#") + 1));
  const source = root.querySelector(`[id="${CSS.escape(id)}"]`);
  if (!source) return null;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-footnote-backref]").forEach((el) => el.remove());
  return { kind: "footnote", label: marker.textContent ?? "", html: clone.innerHTML };
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

type Point = { x: number; y: number };

/** The triangles from the opening point to the card's edges cover the route
    into the card, even when viewport placement flips it above or to the left. */
function inCorridor(card: Box, from: Point, point: Point) {
  const left = card.left - KEEP_SLOP;
  const top = card.top - KEEP_SLOP;
  const right = card.left + card.width + KEEP_SLOP;
  const bottom = card.top + card.height + KEEP_SLOP;
  const corners = [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
  const cross = (a: Point, b: Point, p: Point) =>
    (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return corners.some((a, i) => {
    const b = corners[(i + 1) % corners.length];
    if (Math.abs(cross(from, a, b)) < 0.01) return false;
    const sides = [cross(from, a, point), cross(a, b, point), cross(b, from, point)];
    return sides.every((s) => s >= 0) || sides.every((s) => s <= 0);
  });
}

/** Where the leader should leave a box: the side the card is actually on,
    holding the hand's position along it. Leaving by the facing side is what
    keeps the line outside the words instead of drawn through them. Falls back to
    the nearest edge when the card overlaps the box and no side faces it. */
function exit(b: Box, card: Box, px: number, py: number): Point {
  const right = b.left + b.width;
  const bottom = b.top + b.height;
  const gaps = [
    { side: "left", gap: b.left - (card.left + card.width) },
    { side: "right", gap: card.left - right },
    { side: "top", gap: b.top - (card.top + card.height) },
    { side: "bottom", gap: card.top - bottom },
  ];
  const facing = gaps.reduce((a, g) => (g.gap > a.gap ? g : a));
  if (facing.gap <= 0) return onPerimeter([b], px, py);
  if (facing.side === "left") return { x: b.left, y: clamp(py, b.top, bottom) };
  if (facing.side === "right") return { x: right, y: clamp(py, b.top, bottom) };
  if (facing.side === "top") return { x: clamp(px, b.left, right), y: b.top };
  return { x: clamp(px, b.left, right), y: bottom };
}

/** Does the segment pass through a box's interior? Liang–Barsky, over a box
    pulled in half a pixel so a line that merely departs from an edge — which
    every leader does — does not count as crossing it. */
function crosses(b: Box, from: Point, to: Point) {
  const x0 = b.left + 0.5;
  const y0 = b.top + 0.5;
  const x1 = b.left + b.width - 0.5;
  const y1 = b.top + b.height - 0.5;
  if (x1 <= x0 || y1 <= y0) return false;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const p = [-dx, dx, -dy, dy];
  const q = [from.x - x0, x1 - from.x, from.y - y0, y1 - from.y];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const r = q[i] / p[i];
    if (p[i] < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t0 < t1;
}

/** The square and the line it anchors. Every line of the reference offers a
    departure point; the one that wins is a clear run to the card, and among
    clear runs, the one nearest the hand — so on a phrase that wraps, the square
    stays under the pointer unless staying there would mean drawing through the
    words. */
function tether(boxes: Box[], card: Box, px: number, py: number) {
  let best: { at: Point; to: Point; clear: boolean; d: number } | null = null;
  for (const b of boxes) {
    const at = exit(b, card, px, py);
    const to = corner(card, at.x, at.y);
    const clear = !boxes.some((other) => crosses(other, at, to));
    const d = (at.x - px) ** 2 + (at.y - py) ** 2;
    if (!best || (clear && !best.clear) || (clear === best.clear && d < best.d)) {
      best = { at, to, clear, d };
    }
  }
  return best;
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
  /* An overlay cannot fade out after React has taken its nodes away, so a
     dismissed peek stays mounted for the length of the fade. Everything else
     treats it as already gone — it is on its way out and nothing may reach it. */
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const settle = (going: boolean) => {
    leavingRef.current = going;
    setLeaving(going);
  };

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    clearTimeout(leaveTimer.current);
    openTimer.current = undefined;
    closeTimer.current = undefined;
    leaveTimer.current = undefined;
  };

  const dismiss = useCallback(() => {
    const current = peekRef.current;
    if (!current || leavingRef.current) return;
    clearTimers();
    // Hand focus back to the anchor, but only if it is ours to hand back —
    // a tap somewhere else has already moved it on purpose.
    if (current.via === "tap" && cardRef.current?.contains(document.activeElement)) {
      current.anchor.focus({ preventScroll: true });
    }
    settle(true);
    leaveTimer.current = setTimeout(() => {
      leaveTimer.current = undefined;
      settle(false);
      peekRef.current = null;
      setPeek(null);
      setCarded(false);
      setBoxes(null);
    }, FADE);
  }, []);

  const close = useCallback(() => {
    // Leaving cancels an unopened card immediately. Repeated pointer moves
    // must not postpone dismissal or cancel a fade already in progress.
    clearTimeout(openTimer.current);
    openTimer.current = undefined;
    if (closeTimer.current !== undefined || leavingRef.current) return;
    if (!cardRef.current) {
      dismiss();
      return;
    }
    closeTimer.current = setTimeout(dismiss, CLOSE_DELAY);
  }, [dismiss]);

  const hold = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);

  /* One way in, whichever route found the reference. `delay` of zero means
     there is no hand to wait for — a tap, or a marker reached by keyboard — and
     the card goes straight up beside the words themselves. */
  const open = useCallback(
    (anchor: HTMLElement, source: Source, via: Peek["via"], delay: number) => {
      if (peekRef.current?.anchor === anchor && !leavingRef.current) {
        hold();
        return;
      }
      // Once the reader is inspecting references, switching is immediate.
      const showNow = delay === 0 || cardRef.current !== null;
      clearTimers();
      // Caught on the way out: it fades back in from wherever it had got to
      // rather than blinking.
      settle(false);
      const next = { anchor, source, via };
      peekRef.current = next;
      setPeek(next);
      setCarded(showNow);
      const reveal = () => {
        openTimer.current = undefined;
        const { x, y } = anchorPoint(anchor);
        originRef.current =
          delay !== 0 && cursor.known ? { dx: cursor.x - x, dy: cursor.y - y } : { dx: 0, dy: 0 };
        setCarded(true);
      };
      if (showNow) reveal();
      else openTimer.current = setTimeout(reveal, delay);
    },
    [hold]
  );

  /* Keep the opening offset from the reference. Pointer movement only updates
     the tether; scrolling and resizing can still reposition the card. */
  const place = useCallback(
    (boxes: Box[]): Box | null => {
      const card = cardRef.current;
      const column = containerRef.current;
      const current = peekRef.current;
      if (!card || !column || !current) return null;

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

      /* The card may not cover the words it is about. It is the reference's own
         text sitting on top of the reference, and there is no route from one to
         the other that does not cross the other — which is where a leader drawn
         through the box comes from. So a card that lands on the reference is
         moved clear of the whole of it, under it by preference and over it when
         there is no room below. */
      const line = {
        top: Math.min(...boxes.map((b) => b.top)),
        bottom: Math.max(...boxes.map((b) => b.top + b.height)),
        left: Math.min(...boxes.map((b) => b.left)),
        right: Math.max(...boxes.map((b) => b.left + b.width)),
      };
      const covers =
        left < line.right &&
        left + width > line.left &&
        top < line.bottom &&
        top + height > line.top;
      if (covers) {
        const under = line.bottom + CURSOR_GAP_Y;
        const over = line.top - CURSOR_GAP_Y - height;
        top = under + height <= window.innerHeight - EDGE_PAD || over < EDGE_PAD ? under : over;
        top = clamp(top, EDGE_PAD, window.innerHeight - height - EDGE_PAD);
      }

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      return { left, top, width, height };
    },
    [containerRef]
  );

  /* The whole overlay, redrawn in one pass: the card is moved, the square is put
     on the border, and the leader is stretched between them. None of it goes
     through React — the card's contents would re-render sixty times a second for
     a position change — and keeping it in one callback is what guarantees the
     leader lands on the card rather than a frame behind it. */
  const draw = useCallback(() => {
    const handle = handleRef.current;
    const live = peekRef.current?.via !== "tap";
    // On the way out it holds still. Chasing the hand while fading would read as
    // the overlay flinching rather than leaving.
    if (!handle || !boxes?.length || leavingRef.current) return;

    const card = place(boxes);
    // With no hand to follow — a tap, a keyboard — the square parks on the
    // trailing edge of the last line, where the reference ends.
    const tail = boxes[boxes.length - 1];
    const from =
      live && cursor.known
        ? { x: cursor.x, y: cursor.y }
        : { x: tail.left + tail.width, y: tail.top + tail.height / 2 };

    // Until there is a card the square is free to sit wherever the hand is
    // closest; once there is one it also has a line to carry, and the line
    // decides which side of the words it may leave from.
    const tied = card && tether(boxes, card, from.x, from.y);
    const point = tied ? tied.at : onPerimeter(boxes, from.x, from.y);
    handle.setAttribute("x", (point.x - HANDLE / 2).toFixed(2));
    handle.setAttribute("y", (point.y - HANDLE / 2).toFixed(2));

    const lead = leadRef.current;
    if (!lead || !tied) return;
    lead.setAttribute("x1", point.x.toFixed(2));
    lead.setAttribute("y1", point.y.toFixed(2));
    lead.setAttribute("x2", tied.to.x.toFixed(2));
    lead.setAttribute("y2", tied.to.y.toFixed(2));
  }, [boxes, place]);

  /* Layout, not effect: the card mounts unpositioned, and this is what puts it
     somewhere before the browser gets a chance to paint it there. It has to be
     the parent's — React attaches refs in tree order as it runs layout effects,
     so anything nested would fire before the card's own ref exists. */
  useLayoutEffect(draw, [draw, carded, peek]);

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

    /* Whatever an open reference covers: the phrase and its marker for a
       footnote, the link's own lines for a link. */
    const reach = (anchor: HTMLElement) => {
      const target = targetsRef.current.find((t) => t.anchor === anchor);
      return target ? outline(target) : mergeLines(Array.from(anchor.getClientRects()));
    };

    /* Keep the reference, card, and route between them active. Moving elsewhere
       starts one grace period, rather than renewing it on every frame. */
    const holding = (anchor: HTMLElement) => {
      const card = cardRef.current?.getBoundingClientRect();
      if (card && inside([card], cursor.x, cursor.y, KEEP_SLOP)) return true;
      if (card) {
        const on = anchorPoint(anchor);
        const from = { x: on.x + originRef.current.dx, y: on.y + originRef.current.dy };
        if (inCorridor(card, from, cursor)) return true;
      }
      return inside(reach(anchor), cursor.x, cursor.y, card ? KEEP_SLOP : HIT_SLOP);
    };

    let queued = 0;
    const test = () => {
      // A peek that is fading out is not there to be held onto or closed again;
      // the pointer meeting its reference again opens a fresh one.
      const current = leavingRef.current ? null : peekRef.current;
      if (current?.via === "tap") return;
      // A portal can cover another citation. Reading the card takes priority
      // over the article geometry underneath it.
      const card = cardRef.current?.getBoundingClientRect();
      if (current && card && inside([card], cursor.x, cursor.y)) {
        hold();
        return;
      }

      const marker = document.elementFromPoint(cursor.x, cursor.y)?.closest("a[data-footnote-ref]");
      // Crossing another cited phrase on the way into the current card should
      // not replace what the reader was reaching for. An explicit marker still
      // lets them switch references immediately, even where phrases overlap.
      if (current && card && (!marker || marker === current.anchor)) {
        const on = anchorPoint(current.anchor);
        const from = { x: on.x + originRef.current.dx, y: on.y + originRef.current.dy };
        if (inCorridor(card, from, cursor)) {
          hold();
          return;
        }
      }
      const direct = targetsRef.current.findIndex((target) => target.anchor === marker);
      const found =
        direct !== -1
          ? direct
          : zones().findIndex((boxes) => inside(boxes, cursor.x, cursor.y, HIT_SLOP));

      if (found === -1) {
        if (current && holding(current.anchor)) hold();
        else if (current) close();
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
        hold();
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

    // On touch, links carry their own asterisk rather than surrendering the tap.
    const linkMarkers = Array.from(
      root.querySelectorAll<HTMLButtonElement>("button[data-peek-marker]")
    );

    const enter = (event: PointerEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const source = describeLink(anchor.getAttribute("href") ?? "");
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

    const tapFootnote = (event: MouseEvent) => {
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

    // The asterisk has no default to preserve — it exists only to open this.
    const tapMarker = (event: MouseEvent) => {
      const marker = event.currentTarget as HTMLButtonElement;
      if (peekRef.current?.anchor === marker) {
        clearTimers();
        dismiss();
        return;
      }
      const source = describeLink(marker.dataset.peekHref);
      if (source) open(marker, source, "tap", 0);
    };

    markers.forEach((a) => {
      if (finePointer) {
        // No enter or leave of its own: the phrase around it is the target, and
        // it is hit-tested. Only footnotes open on focus — a card on every
        // tabbed link would be noise; a link already says where it goes.
        a.addEventListener("focus", focus);
        a.addEventListener("blur", close);
      } else {
        a.addEventListener("click", tapFootnote);
      }
    });

    if (finePointer) {
      // A pointer previews a link by hovering the link itself, so the asterisk
      // stays hidden and unwired. No leave of their own: leaving is the
      // proximity test's call, and a link's card is given the same latitude as
      // a footnote's.
      links.forEach((a) => a.addEventListener("pointerenter", enter));
    } else {
      // A finger cannot hover, and tapping a link should go there, so the
      // asterisk beside it is the only way in.
      linkMarkers.forEach((b) => b.addEventListener("click", tapMarker));
    }

    // Reveals the asterisks: they are rendered server-side but inert until
    // something is listening, so a page without JavaScript never shows one.
    root.setAttribute("data-peek-ready", "true");

    return () => {
      clearTimers();
      root.removeAttribute("data-peek-ready");
      [...markers, ...links].forEach((a) => {
        a.removeEventListener("pointerenter", enter);
        a.removeEventListener("focus", focus);
        a.removeEventListener("blur", close);
        a.removeEventListener("click", tapFootnote);
      });
      linkMarkers.forEach((b) => b.removeEventListener("click", tapMarker));
    };
  }, [containerRef, close, dismiss, finePointer, open]);

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
      queued = requestAnimationFrame(() => {
        measure();
        draw();
      });
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
  }, [peek, carded, containerRef, draw]);

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
    <div
      className="peek"
      data-leaving={leaving ? "true" : undefined}
      aria-hidden={tapped ? undefined : true}
    >
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
