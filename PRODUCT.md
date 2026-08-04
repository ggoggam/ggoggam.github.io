# Product

꼬깜 (ggoggam) — a personal technical blog at blog.ggoggam.dev, written and maintained by one person.

## Platform

web

## Stack

React 19 + TypeScript, TanStack Router (file-based), Vite 6, Tailwind CSS, MDX with remark/rehype
(GFM, KaTeX math, Shiki highlighting), Giscus comments over GitHub Discussions. Bun as runtime and
package manager. Statically prerendered and deployed to GitHub Pages via GitHub Actions.

## Users

Working software engineers who arrive from a link — a search result, an aggregator, a colleague — to
read one specific post. Most are strangers on their first and possibly only visit. A smaller group
returns to see whether anything new was published. Many read Korean as well as English; the author is
based in Seoul.

## Product Purpose

Publish two kinds of writing and make each findable and readable:

- **blog** — long-form posts working through a problem end to end (10 posts, e.g. content-defined
  chunking for dataset versioning, self-hosted CI on Railway, JWT misuse).
- **til** — short "today I learned" notes on a single fact or technique (8 posts).

Success is a reader finishing the post and understanding the thing.

## Positioning

A working engineer's notebook, not a publication and not a personal brand vehicle. The writing is
first-person, specific, and technical; it shows real work rather than summarizing other people's.

## Operating Context

Read on a desktop or laptop browser most often, phone sometimes, frequently as one of many open tabs.
Posts are long — a reader may stay 10+ minutes on a single page. Sessions happen at any hour, so the
surface is read under both daylight and a dark room.

## Capabilities and Constraints

- Content is MDX on disk; adding a post means adding a file with frontmatter (title, date, excerpt,
  tags, published).
- Posts are filterable by tag within `/blog` and `/til` via a `?tag=` search param.
- A post's page carries a Giscus comment thread.
- The home page shows the 6 most recent posts across both types, plus a generative Schotter canvas.
- A red indicator appears on the wordmark when either section has a post from the last month.
- One TIL (`gershgorin`) embeds an interactive canvas component and is the only post using KaTeX math.
- Static hosting only: no server, no database, no image pipeline. Everything ships as prerendered
  HTML plus assets in `public/`.

## Brand Commitments

- The wordmark is **꼬깜**, set in Korean. It is the site's name and the author's handle.
- Section names are lowercase: `blog`, `til`, `about`.
- Dates display as ISO `yyyy-MM-dd`.
- The cat, Ggoggam (꼬깜), is the namesake and appears on the About page.

## Evidence on Hand

18 real posts, real tags, real dates, a real photo set of the author's cat, a working generative
canvas. No claims, metrics, testimonials, or commercial content exist or should be invented.

## Product Principles

- The prose is the product; everything else gets out of its way.
- Metadata is support, never competition for the title.
- Nothing on the page should be there because blogs usually have it.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Mixed Korean/Latin typography must render both scripts well. Readers use the site
in dark rooms, so a dark theme is a real requirement rather than a preference.
