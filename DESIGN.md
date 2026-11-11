# Design: 꼬깜

Swiss / Japanese minimalism, with Tadao Ando's architecture as the user's
reference for the feeling: stillness, empty space, precision, and quiet materials.
This direction supersedes the earlier Skiper-inspired notebook treatment.

## Composition

An 880px browsing measure, generous outer margins, and a restrained grey surface.
The homepage contains an unframed drawing followed by six dated post titles.
The drawing is centred within the content column on both desktop and mobile.
The drawing is 책가도; its compartments are filled anew on each load.

The header contains only the Korean wordmark and three lowercase section links.
The footer contains copyright, GitHub, source, and the theme control.

No introductory slogans, taglines, excerpts in post lists, counts, badges,
teaser sections, coloured panels, card shadows, or decorative navigation motion.
Existing About content and photographs remain on About.

Archives are named simply “blog” and “til.” Tag filters are collapsed by default
and use plain text. A selected filter remains in the URL. Posts are single
focusable links with ISO dates, regular-weight titles, and thin separating rules.
The recent list also has a small plain-text section label per entry.

## Type and space

- Pretendard Variable: headings, post titles, body, navigation, and supporting text;
  mixed Korean/Latin support.
- Geist Mono: dates, metadata, and code.
- Post titles: 17px desktop, 16px mobile, 1.6 line height.
- About body: 15px, 1.8 line height.
- Archive titles: 28px, regular weight.
- Article titles: fluid 28–42px, medium weight, 1.35 line height.
- Reading measure: the existing 64ch.
- Desktop side gutter: 40px minimum; mobile: 24px.
- Empty space is intentional. Do not fill it with additional copy or decoration.

## Material

| Token       | Light   | Dark    |
| ----------- | ------- | ------- |
| paper       | #f5f5f2 | #141615 |
| paper-sunk  | #eeefeb | #1d201e |
| ink         | #292b29 | #dedfd9 |
| ink-muted   | #666963 | #a0a59c |
| rule        | #dcded7 | #30352f |
| rule-strong | #bec2b9 | #535a50 |

The chrome is monochrome. Colour remains available for real post content,
syntax highlighting, errors, and the existing mathematical plot.

Light, dark, and system preferences are peers. The footer's icon button cycles
system → light → dark → system and persists through the existing theme store.
The page's browser theme colours match these surfaces. Giscus and syntax
highlighting continue to follow the selected preference.

## Drawing and interaction

The drawing is a hairline figure, in the style and on the engine of
@lucasmarkes/hairline: an isometric line drawing of rounded solids in one stroke, in
four weights taken from paper and ink, that answers the pointer. 책가도 is a Joseon
scholar's bookcase standing before an 일월오봉도 folding screen; its compartments are
filled at random on each load from books and scholar's objects. It has no caption, and
the drawing holds no words.

The kernel and figure in src/hairline/ stay byte-for-byte what the hairline skill builds
and checks; vite.config.ts wraps them as modules, loaded on the client after the page.

Drawings move only in answer to the reader, under the pointer. Nothing plays on its own. Post views also
include a Skiper95-inspired vertical reading ruler in the outer gutter. On desktop,
the active tick grows in place with a “section title · percentage” label beside it;
the label steps between ticks as reading progresses. Before the
first section, and in posts without headings, the label uses the post title. It measures
through the end of the prose, excluding comments. Smaller screens show only the
progress rail so the label does not obscure it. Desktop titles stay within the
gutter, truncating when needed while the percentage remains visible.
Reduced-motion preferences disable interpolation.
Links use simple underlines on hover/focus. Nothing animates on arrival or continuously.

## Reading and accessibility

Preserve visible focus outlines, the skip link, semantic landmarks, heading
levels, native keyboard controls, readable metadata, and responsive wrapping.
The home h1 is visually hidden; the wordmark supplies its visible identity.

The existing prose system remains: heading permalinks, underlined links, code
line numbers, dual-theme highlighting, horizontally scrollable code/math/tables,
footnotes, reference previews, and Giscus comments.

## Files

- src/app/notebook.css: the browsing surface, updated theme tokens, responsive layout.
- src/app/globals.css: shared prose, code, math, and reference styling.
- src/components/hairline-figure.tsx: mounts one hairline figure.
- src/hairline/: the hairline kernel and the 책가도 figure, unchanged from the skill's output.
- src/components/art-gallery.tsx: the home page's drawing.
- src/components/post/post-preview.tsx: dated title rows.
- src/components/site/: plain navigation, footer, and theme control.

No new dependencies or changes to the posts themselves are needed.
