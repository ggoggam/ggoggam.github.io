import { createFileRoute, Link } from "@tanstack/react-router";
import { getRecentPosts } from "@/lib/posts";
import { SchotterCanvas } from "@/components/schotter-canvas";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => getRecentPosts(),
  component: HomePage,
});

function HomePage() {
  const posts = Route.useLoaderData();
  useSeo({
    description: "A blog about software engineering, machine learning, and more.",
  });

  return (
    <div>
      <header className="mb-12">
        <h1 className="title-display text-title">Notes on software engineering</h1>
        <p className="mt-3 max-w-[46ch] text-lede leading-[1.6] text-ink-muted">
          Long-form posts on problems worked through end to end, and shorter notes on one thing at a
          time.
        </p>
      </header>

      <section aria-labelledby="recent">
        <h2 id="recent" className="label mb-1 border-b border-rule pb-4">
          recent
        </h2>
        <ul>
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-rule">
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
                <time className="label shrink-0 pt-[0.3em] sm:w-[6.5rem]" dateTime={post.date}>
                  {post.date}
                </time>
                <Link
                  to={post.url}
                  className="title-display min-w-0 flex-1 text-h3 no-underline decoration-rule-strong hover:underline"
                >
                  {post.title}
                </Link>
                <span className="label shrink-0 pt-[0.4em] text-2xs">{post.type}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* The plate closes the page rather than opening it: it is the author's
          signature, not what a first-time reader arrived for. */}
      <figure className="mt-20 flex flex-col items-center gap-5 border-t border-rule pt-14">
        <SchotterCanvas />
        <figcaption className="max-w-[42ch] text-center text-sm leading-relaxed text-ink-muted">
          <a href="https://collections.vam.ac.uk/item/O221321/schotter-print-nees-georg/">
            <cite className="not-italic">Schotter</cite>
          </a>
          , George Nees, 1968. Redrawn on every visit.
        </figcaption>
      </figure>
    </div>
  );
}
