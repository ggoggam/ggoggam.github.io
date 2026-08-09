import { getBlogPosts, getTILPosts, type PostMeta } from "@/lib/posts";

/* What a link can honestly promise before you follow it. For a post on this
   site, the post — the site already knows its title, date, and excerpt. For
   anywhere else, the destination, spelled out, which without a build-time
   metadata fetch is the only true thing there is to say about it.

   Two callers need the same answer to the same question. The peek needs it to
   fill a card; the MDX link component needs it to decide whether a link is
   worth hanging a marker off at all. A marker that opened an empty card would
   be worse than no marker. */

export type LinkPreview =
  | { kind: "post"; label: string; post: PostMeta }
  | { kind: "link"; label: string; host: string; path: string };

let byUrl: Map<string, PostMeta> | null = null;
const posts = () =>
  (byUrl ??= new Map([...getBlogPosts(), ...getTILPosts()].map((p) => [p.url, p])));

export function describeLink(href: string | undefined): LinkPreview | null {
  if (!href || href.startsWith("#")) return null;

  if (href.startsWith("/")) {
    const post = posts().get(href.replace(/\/$/, ""));
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

/** What the marker announces to a screen reader, since `*` says nothing. */
export function previewLabel(preview: LinkPreview): string {
  return preview.kind === "post"
    ? `Preview the linked post, ${preview.post.title}`
    : `Preview the destination, ${preview.host}`;
}
