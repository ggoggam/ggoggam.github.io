/* Which words does a footnote actually annotate?

   Markdown does not say. `[^1]` marks a point, not a span, so there is no
   phrase to underline the way a hand-authored reference anchor would have one.
   The convention readers already use is that a marker annotates the clause it
   sits at the end of, and that is recoverable: walk back through the text of
   the block to the nearest clause break.

   The result is drawn with the CSS Custom Highlight API rather than by wrapping
   the words in a span. Wrapping would mean mutating prose React did not render
   and cannot reconcile; a Range is just a pair of coordinates over the text
   that already exists, and it survives reflow on its own. */

/** A clause ends at terminal punctuation, a list comma, or a spaced dash. The
    trailing `\s+` matters: it keeps `v0.2.0` and `runs-on/cache` intact. */
const CLAUSE_BREAK = /(?:[.!?;:,]|\s[—–])\s+/g;
/** Long enough to be a phrase rather than a stray word or a bracket. */
const MIN_PHRASE = 3;
/** Past this the underline stops reading as a citation and starts reading as
    a highlighter pen, so it is cut back to whole words. */
const MAX_PHRASE = 140;

const BLOCKS = "p, li, td, th, blockquote, dd, figcaption";

function phraseStart(text: string): number {
  const stops: number[] = [];
  for (const match of text.matchAll(CLAUSE_BREAK)) stops.push(match.index + match[0].length);

  let start = 0;
  // The nearest break can sit right against the marker — a footnote placed
  // after the full stop rather than before it. Keep stepping back until the
  // span picked up is actually a phrase.
  while (stops.length) {
    const candidate = stops.pop()!;
    if (text.slice(candidate).trim().length >= MIN_PHRASE) {
      start = candidate;
      break;
    }
  }

  if (text.length - start > MAX_PHRASE) {
    const cut = text.length - MAX_PHRASE;
    const space = text.indexOf(" ", cut);
    start = space === -1 ? cut : space + 1;
  }
  return start;
}

/** The run of words a marker hangs off, as a live Range, or null if there is
    no prose in front of it to point at. */
export function citedPhrase(marker: HTMLElement): Range | null {
  const block = marker.closest(BLOCKS);
  if (!block) return null;

  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  const starts: number[] = [];
  let text = "";

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    // Stop at the marker itself; everything past it belongs to the next clause.
    if (marker.contains(node)) break;
    if (marker.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) break;
    starts.push(text.length);
    nodes.push(node as Text);
    text += node.nodeValue ?? "";
  }

  if (!nodes.length || !text.trim()) return null;

  const from = phraseStart(text);
  let index = nodes.length - 1;
  while (index > 0 && starts[index] > from) index--;

  const last = nodes[nodes.length - 1];
  // Markdown rarely leaves a space before a marker, but when it does the
  // underline should not run out into it.
  const end = (last.nodeValue ?? "").replace(/\s+$/, "").length;
  // `from` indexes the concatenated text; both range boundaries are offsets
  // within their own node, so it has to be rebased before either is used.
  const start = Math.min(from - starts[index], nodes[index].length);
  if (nodes[index] === last && start >= end) return null;

  const range = document.createRange();
  range.setStart(nodes[index], start);
  range.setEnd(last, end);
  return range;
}

export const supportsHighlights = () =>
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";
