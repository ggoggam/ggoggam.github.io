# Design: 꼬깜

Swiss / Japanese minimalism, with Tadao Ando's architecture as the user's
reference for the feeling: stillness, empty space, precision, and quiet materials.
This direction supersedes the earlier Skiper-inspired notebook treatment.

## Composition

An 880px browsing measure, generous outer margins, and a restrained grey surface.
The homepage contains an unframed drawing followed by six dated post titles.
The drawing is centred within the content column on both desktop and mobile.

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

Schotter is a seeded, prerenderable SVG of 216 squares. Its portrait proportions
and single attribution let it sit like a small work on an otherwise empty wall.
Clicking the drawing or activating it with Enter/Space generates a new variation.
A descriptive button name and a polite live announcement support screen readers.

Only the squares animate, and only in response to deliberate activation.
Reduced-motion preferences disable this interpolation. Links use simple
underlines on hover/focus. Nothing animates on arrival or continuously.

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
- src/components/schotter-canvas.tsx: the SVG drawing; existing component name retained.
- src/components/post/post-preview.tsx: dated title rows.
- src/components/site/: plain navigation, footer, and theme control.

No new dependencies or changes to the posts themselves are needed.
