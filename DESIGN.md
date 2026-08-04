---
name: 꼬깜 (ggoggam)
description: A reading surface where hierarchy comes from typographic register, not from boxes.
colors:
  paper: "#fbfbfb"
  paper-sunk: "#f4f4f3"
  ink: "#111111"
  ink-muted: "#5c5c5c"
  ink-faint: "#8a8a8a"
  rule: "#e3e3e1"
  rule-strong: "#c9c9c6"
  accent: "#d93a1e"
  focus: "#111111"
  plot-1: "#d93a1e"
  plot-2: "#1d4ed8"
  plot-3: "#111111"
typography:
  display:
    fontFamily: '"Noto Sans KR", "Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(2rem, 1.42rem + 2.48vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: '"Noto Sans KR", "Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1.375rem, 1.22rem + 0.66vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Noto Sans KR", "Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  lede:
    fontFamily: '"Pretendard Variable", Pretendard, ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(1.0625rem, 1rem + 0.28vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: '"Pretendard Variable", Pretendard, ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(1rem, 0.96rem + 0.18vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.72
  label:
    fontFamily: '"Spline Sans Mono", "Pretendard Variable", Pretendard, ui-monospace, monospace'
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: '"tnum" 1'
  label-micro:
    fontFamily: '"Spline Sans Mono", "Pretendard Variable", Pretendard, ui-monospace, monospace'
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.06em"
  wordmark:
    fontFamily: '"Pretendard Variable", Pretendard, ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(1.125rem, 1.05rem + 0.32vw, 1.3125rem)"
    fontWeight: 700
    letterSpacing: "-0.025em"
rounded:
  none: "0"
  hairline: "1px"
  image: "2px"
  code-inline: "3px"
  code-block: "4px"
  full: "9999px"
spacing:
  gutter: "24px"
  row: "20px"
  block: "40px"
  section: "56px"
  measure: "64ch"
components:
  nav-link:
    typography: "{typography.label}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "8px 8px"
  nav-link-active:
    typography: "{typography.label}"
    textColor: "{colors.ink}"
  tag-filter:
    typography: "{typography.label-micro}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "4px 4px"
  tag-filter-selected:
    typography: "{typography.label-micro}"
    textColor: "{colors.ink}"
  post-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px 0"
  input-text:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.image}"
    padding: "8px 12px"
  input-text-invalid:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
  code-block:
    backgroundColor: "{colors.paper-sunk}"
    rounded: "{rounded.code-block}"
    padding: "16px 0"
  new-post-indicator:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    size: "5px"
---

# Design System: 꼬깜 (ggoggam)

## Overview

**Creative North Star: "The Ruled Notebook"**

This is a reading surface built out of paper, ink, and one hairline. Nothing is
boxed, nothing is filled, nothing is lifted. Hierarchy is carried entirely by
typographic register — a bold neutral sans for what is being read, a tracked
uppercase mono for what is being read *about* — and by a single 1px rule that
separates rows, headers, and footers. There is no card, no pill, no chip, and no
shadow anywhere in the build; a grep across `src/` and `globals.css` returns zero
`box-shadow` declarations and zero background-filled metadata.

The density is editorial rather than app-like. One measure (64ch, tuned by
counting rendered characters-per-line at ~72) governs the header, the main
column, and the footer alike, so the page reads as one column of set text with
rules across it rather than as a shell containing content. Type is fluid per
role — every step is a `clamp()` travelling between a 375px and a 1280px
viewport — so nothing snaps at a breakpoint. Light and dark are peer themes
declared through `prefers-color-scheme` and `color-scheme`, not a dark mode
bolted onto a light design. The footer toggle overrides that system reading
without displacing it: it cycles auto → light → dark, and auto — the absence of
any stored choice — is where every visitor starts and can return to.

The confirmed rejection is the Tailwind-blog default: gray pills for tags, bold
sans headings, and metadata faded until it fails contrast. The system's answer to
all three is the same move — metadata recedes by *register* (small, mono,
uppercase, tracked) while staying at full contrast, never by dropping toward the
background.

**Key Characteristics:**

- Near-white paper / near-black ink; a single accent that is nearly absent.
- One hairline weight (1px) in two strengths; zero shadows, zero filled chips.
- Three type roles — bold display sans, mono label, Pretendard body — where display and body each draw Hangul in their own voice, and Pretendard backs the mono stack, which does not.
- Fluid `clamp()` scale per role, 375px → 1280px, no breakpoint steps.
- One 64ch measure shared by header, content, and footer.
- Contrast floor enforced by token: `--ink-muted` is the least any real text may be.

## Colors

Restrained near-monochrome: a paper/ink neutral field with one red that appears
on almost nothing, plus a separate ink set reserved for data.

### Primary

- **Signal Red** (`#d93a1e` light / `#ff6a4d` dark): The system's only chromatic voice in the interface chrome. It marks the new-post indicator on the wordmark — a 5px dot — and nothing else in navigation, prose, links, or headings. The build also uses it for one semantic error state (the invalid-matrix border and message inside the Gershgorin canvas), which is a small divergence from the direction contract's "red appears once"; the build wins, and the rule below records both allowances as closed.

### Neutral

- **Daylight Paper** (`#fbfbfb` light / `#0e0e0e` dark): The page ground. Named paper, not cream — the reading scene assumed by the build is a browser tab in daylight, not a book.
- **Sunk Paper** (`#f4f4f3` light / `#171717` dark): The only recessed surface in the system, used for code blocks, inline code, and the one text input. It replaces what a card background would otherwise do.
- **Full Ink** (`#111111` light / `#ededed` dark): All running text, all headings, the wordmark, the selection background, and the focus ring.
- **Muted Ink** (`#5c5c5c` light, 6.4:1 on paper / `#9e9e9e` dark, 7.1:1): The metadata voice — labels, dates, excerpts, captions, table headers, code line numbers, blockquotes. This is the *floor* for text, not a fade.
- **Faint Ink** (`#8a8a8a` light, 3.3:1 / `#6b6b6b` dark): Non-text only — list markers and the resting state of the heading copy-link glyph. It never carries a word a reader has to parse.
- **Hairline** (`#e3e3e1` light / `#262626` dark): The default border color for every element (`* { border-color: var(--rule) }`) — row dividers, header/footer rules, code and image borders.
- **Hairline Strong** (`#c9c9c6` light / `#3a3a3a` dark): The second-strength rule: resting link underlines, blockquote bars, table header underlines, scrollbar thumbs, and the plot axis stroke.

### Tertiary (data visualization only)

- **Poster Tomato** (`#d93a1e` / `#ff6a4d`), **Poster Blue** (`#1d4ed8` / `#6f9bff`), **Poster Black** (`#111111` / `#ededed`): Swiss-poster inks used exclusively by the Gershgorin canvas to tell overlapping discs apart, applied as transparent overprints with a `--plot-blend` of `multiply` in light and `screen` in dark so crossings mix into a third color instead of collapsing to black.

### Named Rules

**The One Red Rule.** Red is a state, never a decoration. It is allowed on exactly two things in the shipped build: the new-post indicator dot and the invalid-input state of the Gershgorin matrix field. It never appears on links, buttons, headings, tags, or hovers. If a new surface wants red for emphasis, the answer is the display face, not the accent.

**The Contrast Floor Rule.** `--ink-muted` is the darkest a piece of real text is ever allowed to get. `--ink-faint` is reserved for rules, list markers, and non-text glyphs. Metadata recedes by typographic register — smaller, mono, uppercase, tracked — never by moving toward the background.

**The Data-Ink Rule.** The `--plot-*` group is scoped to data visualization. It is not a UI palette; no button, badge, link, or heading may draw from it.

## Typography

**Display Font:** Noto Sans KR (variable, weights 400–700; set at 700), drawing Hangul and Latin from one family, falling back through Pretendard to Helvetica Neue and Arial
**Body Font:** Pretendard Variable (falling back to system sans)
**Label/Mono Font:** Spline Sans Mono (italic and roman, 400–600), falling back through Pretendard

**Character:** A neutral humanist sans against a neutral geometric mono. The display face does all the announcing and the mono does all the annotating. Noto Sans KR covers Hangul and Latin in one family, so a Korean title announces in the same voice as an English one instead of dropping to the body face — but it is also close in temperament to Pretendard, which means the display voice gets almost nothing from the drawing itself. Weight does the work instead: display is set at 700 against body at 400, a two-step gap wide enough to read as a different voice rather than as emphasis. Pretendard still sits under the mono stack, which draws no Korean of its own, and remains the face of the 꼬깜 wordmark.

### Hierarchy

- **Display** (700, `clamp(2rem, 1.42rem + 2.48vw, 3.5rem)` = 32→56px, 1.04, −0.02em, balanced wrap): The `h1` of a post. One per page. The index pages set their `h1` visually-hidden — the masthead nav already names the section, and the home page opens on the Schotter plate instead.
- **Headline** (700, `clamp(1.375rem … 1.75rem)`, 1.04, −0.02em): `h1`/`h2` inside prose. Spaced 56px above, 16px below, so sections read as grouped.
- **Title** (700, `clamp(1.0625rem … 1.25rem)`, 1.04, −0.02em): Post-row links in every list, and `h3` in prose. The display face at body size is what makes a list of titles read as a contents page.
- **Lede** (400, `clamp(1.0625rem … 1.25rem)`, 1.6): The opening standfirst copy of a page. Only the About page still runs one — the index pages carry no visible title or standfirst.
- **Body** (400, `clamp(1rem … 1.125rem)`, 1.72, capped at 64ch): All prose. Paragraph rhythm is 20px top and bottom.
- **Label** (400, 12px, 0.14em, uppercase, tabular figures): Every date, section nav item, tag heading, kind marker, footer link, table header, and caption. `label-strong` is the same voice at full ink for the active or emphasized instance.
- **Micro label** (400, 11px, 0.06em, uppercase): Tag chips and the kind marker in dense rows, where 0.14em would break the word apart at that size.
- **Wordmark** (Pretendard 700, `clamp(1.125rem … 1.3125rem)`, tight tracking): 꼬깜 only. The one place the body face is set bold.

### Named Rules

**The Three Voices Rule.** The display sans announces, mono annotates, Pretendard reads. A piece of text picks exactly one. A heading is never set in the body face — the two sans faces are told apart by weight alone, so borrowing Pretendard for a heading collapses the distinction entirely.

**The Label Length Rule.** The label voice is for one to three words. Sentence-length copy — excerpts, ledes, descriptions, captions — stays in the body face at `--ink-muted`, because 0.14em tracking on a sentence stops being a label and starts being unreadable.

**The Measure Rule.** 64ch (`--measure`) is the width of the site, not just of the prose. Header, main, and footer all share it, so the hairlines line up top to bottom.

## Layout

A single centered column of `max-w-measure` (64ch) with a 24px gutter, used
identically by the header nav, the main content, and the footer. There is no
grid system and no sidebar; the only multi-column construct in the build is the
About page photo set (2 columns, 3 at ≥640px, 12px gap) and the post row, which
is a stacked flex column on small screens and a baseline-aligned row at ≥640px
with a fixed 6.5rem date column and 24px gap.

Vertical rhythm comes from a small set of repeated steps rather than a numeric
scale: 40px above and below main content (56px at ≥640px), 40px under a page
header, 20px per post row, 56px above a prose heading and 16px under it, 64px
before the comments section, 64px under the opening plate on the home page.
Header padding is asymmetric on purpose — 40px above the wordmark (56px at
≥640px), 20px below — so the masthead sits down from the top edge rather than
being vertically centered in a bar.

Only one breakpoint does real work: `sm` (640px). Everything else scales
continuously through the fluid type scale, which is why the layout has no
tablet-specific state. `scrollbar-gutter: stable` on `html` keeps the centered
column from shifting when a page grows past the viewport.

## Elevation & Depth

**This system has no shadows.** There is not a single `box-shadow` in the
stylesheet or in any component. Depth is expressed two ways and only two ways:
by a 1px hairline (`--rule`, with `--rule-strong` for the second level), and by
one recessed tone (`--paper-sunk`) used for code and inputs. A code block is
"below" the page because it is a slightly darker paper inside a hairline, not
because it floats.

Motion is equally thin: 150ms `ease-out` on link underline color, and
`transition-colors` on nav, tag, and footer links. The only other movement is a
90° rotation on the tag-index disclosure marker and an opacity fade on the
heading copy-link. A global `prefers-reduced-motion: reduce` block collapses every
animation and transition to 0.01ms.

### Named Rules

**The No-Lift Rule.** Nothing in this system casts a shadow, and nothing moves on the z-axis. If an element needs to read as separate, give it a hairline or the sunk paper tone. If it needs to read as active, give it full ink.

**The One Hairline Rule.** There is exactly one border weight in the system: 1px. Emphasis is a change of color (`--rule` → `--rule-strong` → `--ink`), never of thickness.

## Shapes

The form language is square by default. Row dividers, headers, footers, nav
items, tags, and the tag index all have zero radius; the underline and the rule
are the only shapes they have. Radius appears only where a physical object is
being depicted, and then only barely: 2px on prose images and the About photo
grid, 3px on inline code, 4px on code blocks, 2px on the one text input, 1px on
the focus ring so it does not read as a hard rectangle, and full-round on the
5px new-post dot — the only circle in the system.

Interactive elements are hit-padded rather than boxed: nav links carry 8px
padding on both axes, tag buttons 4px, footer links 8px/4px, and the copy-link
button is a 24px square. The padding exists to meet the 24px minimum target, not
to create a visible button.

## Components

### Navigation

The masthead is a wordmark and three lowercase mono links sharing a baseline on
one hairline. Links are `.label` (12px mono, uppercase, 0.14em, muted ink) with
8px padding for target size; the active section is `label-strong` (full ink)
plus `aria-current="page"`. There is no underline, no background, and no
indicator bar — the color change *is* the state. The wordmark is the only bold
Pretendard on the site and carries the 5px accent dot when either section has a
post from the last month, with the reason spoken to screen readers in a
visually-hidden span. The footer is the same construction inverted: a mono
copyright left, mono external links right, on a top hairline.

### Theme Toggle

Last item in the footer row, and built as a footer link rather than as a
control: the label voice, no border, no background, no icon, no switch. The word
it shows — `auto`, `light`, `dark` — is the theme currently in force, and a
press advances the cycle; the accessible name carries both halves ("Theme: auto.
Switch to light.") because the visible word alone cannot say which it is. It is
fixed at 9ch so the footer does not reflow as the word changes length. The
choice is stored under one key and re-applied by an inline script in the
document head before first paint, so a stored theme never flashes the system one
first. Everything that reads a color at paint time rather than through CSS —
both canvases, and the Giscus iframe — is handed the same choice.

### Post Row (signature)

The list primitive of the whole site. A bottom hairline, a fixed 6.5rem mono
date column, and a title in the display face at `--text-h3`; a home-page row adds
a right-aligned micro-label for the kind, an archive row adds a muted body-face
excerpt beneath. The title link is undecorated at rest and underlines on hover
in `--rule-strong`. There is no card, no thumbnail, no read-time, and no tag pill
on the row — the tag index above the list does that job.

### Tag Index

Tags are undecorated mono microtype in a wrapping baseline row, not chips: no
background, no border, no radius. Selection is expressed as full ink plus an
underline, with `aria-pressed`. The whole index lives inside a `<details>` that
stays folded until a tag is active, because twenty tags ahead of the first post
is a wall. The summary line reads current-filter, tag count, disclosure marker.

### Inputs

One text input exists in the build (the Gershgorin matrix field). Sunk paper
ground, 1px hairline, 2px radius, 8px/12px padding, mono at 13px. Invalid state
swaps the border to the accent and reveals a mono accent message wired through
`aria-invalid` and `aria-describedby`. Focus is not a custom treatment: it is the
global focus token.

### Prose

Hand-authored in `globals.css`; the `@tailwindcss/typography` plugin is
deliberately absent, so no upstream defaults leak in. Paragraphs 20px apart at
1.72 line-height inside 64ch. Blockquotes are a `--rule-strong` left hairline with
italic muted text, no background. Tables read as ruled ledgers: mono uppercase
headers over a strong rule, rows separated by hairlines, never a filled header
band. Footnote back-references are mono at 0.7em.

### Code Blocks

Dual-themed by rehype-pretty-code with the **high-contrast** GitHub variants
(`github-light-high-contrast` / `github-dark-high-contrast`), chosen because the
standard GitHub themes fall under 4.5:1 on `--paper-sunk`. Shiki writes
`--shiki-light` / `--shiki-dark` onto each token span and the stylesheet selects
one per media query at the span's own scope. Sunk paper, 1px hairline, 4px
radius, 13px mono at 1.7, horizontal scroll with a `--rule-strong` thumb. Line
numbers are generated content but are still text a reader parses, so they sit at
`--ink-muted`, not `--ink-faint`, and can be switched off per block.

### Generative Plates

Two canvases carry the site's only imagery: a Schotter homage that opens the
home page in place of a title, and the interactive Gershgorin plot in one TIL. Both
read their strokes from the live CSS custom properties, so they re-theme with
the page instead of shipping baked colors. Data color is the only place the
system permits more than one hue at a time.

## Do's and Don'ts

### Do:

- **Do** express metadata as `.label` — 12px Spline Sans Mono, uppercase, 0.14em, `--ink-muted`, tabular figures — and mark the active one with `label-strong`.
- **Do** set every title and heading in the display face via `.title-display` (Noto Sans KR 700, −0.02em, 1.04, balanced wrap) — it holds for Korean titles too.
- **Do** separate things with a 1px hairline in `--rule`, escalating to `--rule-strong` and then `--ink` for emphasis.
- **Do** keep every column inside the shared 64ch `--measure`, with a 24px gutter.
- **Do** give interactive text at least 24px of hit area through padding, and leave the padding invisible.
- **Do** use the one `:focus-visible` token everywhere: 2px solid `--focus`, 3px offset, 1px radius.
- **Do** read colors from CSS custom properties at draw time in canvas work, so both themes are served by one code path.
- **Do** state dates as ISO `yyyy-MM-dd` in the mono voice with `tnum` on, so columns of dates align.

### Don't:

- **Don't** add a shadow. There are none in the build, and depth is a hairline or the sunk paper tone.
- **Don't** put a filled background behind a tag, kind marker, date, or status word. Tags are microtype, not chips.
- **Don't** set a heading in the body face. `.title-display` is the only heading voice.
- **Don't** drop text below `--ink-muted` to make it recede; change its register instead. `--ink-faint` is for rules, markers, and non-text only.
- **Don't** spend the accent on anything but the new-post indicator and a genuine invalid state.
- **Don't** pull `--plot-1/2/3` into UI chrome; they exist to separate overlapping data and nothing else.
- **Don't** apply `.label` to sentence-length copy — one to three words is the limit of the tracked voice.
- **Don't** introduce a second border weight or a general-purpose corner radius; square is the default and radius is reserved for depicted objects.
- **Don't** re-enable `@tailwindcss/typography`; `.prose` is hand-authored so no upstream defaults can leak past these tokens.
