import PostPreview from "./post-preview";
import type { PostMeta } from "@/lib/posts";

export type PostListProps = {
  title: string;
  description: string;
  posts: PostMeta[];
  selectedTag: string | undefined;
  onTagChange: (tag: string | undefined) => void;
};

export default function PostList({
  title,
  description,
  posts,
  selectedTag,
  onTagChange,
}: PostListProps) {
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  const filtered = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts;

  return (
    <div>
      <header className="mb-10">
        <h1 className="title-display text-title">{title}</h1>
        {/* Sentence-length copy stays in the body face; the label voice is for
            one to three words, where the tracking still reads as a label. */}
        <p className="mt-3 text-ink-muted">{description}</p>
      </header>

      {allTags.length > 0 && (
        // Twenty tags ahead of the first post is a wall, so the archive's index
        // stays folded until someone actually wants to narrow the list.
        <details open={selectedTag !== undefined} className="group mb-2 border-b border-rule pb-4">
          <summary className="label inline-flex cursor-pointer list-none items-baseline gap-2 py-1 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="label-strong">{selectedTag ?? "all posts"}</span>
            <span className="text-2xs">{allTags.length} tags</span>
            <svg
              aria-hidden="true"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="translate-y-[0.05em] transition-transform group-open:rotate-90"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </summary>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <button
              type="button"
              onClick={() => onTagChange(undefined)}
              aria-pressed={selectedTag === undefined}
              className={`label px-1 py-1 text-2xs tracking-[0.06em] transition-colors hover:text-ink ${
                selectedTag === undefined ? "label-strong underline" : ""
              }`}
            >
              all
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(selectedTag === tag ? undefined : tag)}
                aria-pressed={selectedTag === tag}
                className={`label px-1 py-1 text-2xs tracking-[0.06em] transition-colors hover:text-ink ${
                  selectedTag === tag ? "label-strong underline" : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </details>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-ink-muted">
          Nothing tagged <span className="label label-strong">{selectedTag}</span> yet.
        </p>
      ) : (
        <ul aria-label={selectedTag ? `Posts tagged ${selectedTag}` : "All posts"}>
          {filtered.map((post) => (
            <PostPreview key={post.slug} {...post} />
          ))}
        </ul>
      )}
    </div>
  );
}
