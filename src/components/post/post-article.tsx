import Giscus from "@giscus/react";
import { Link } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { useRef } from "react";
import { mdxComponents } from "@/components/mdx-component";
import ReferencePeek from "@/components/post/reference-peek";
import { useThemePref } from "@/lib/theme";
import { ArrowIcon } from "@/components/site/arrow-icon";

export type PostArticleProps = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  type: "blog" | "til";
  Component: React.ComponentType<{ components?: MDXComponents }>;
};

export default function PostArticle({
  slug,
  title,
  date,
  tags,
  type,
  Component,
}: PostArticleProps) {
  // The comment thread is an iframe with its own theme, so it has to be handed
  // the same choice the page made rather than reading the system on its own.
  const pref = useThemePref();
  // The peek reads the footnote list out of this subtree and measures the
  // column against it, so it needs the article box, not the prose box.
  const articleRef = useRef<HTMLElement>(null);

  return (
    <article ref={articleRef} className="reading-article">
      <Link to={`/${type}`} className="article-back">
        <span>
          <ArrowIcon />
        </span>{" "}
        back to {type}
      </Link>
      <header className="mb-10 border-b border-rule pb-8">
        <h1 className="title-display text-title">{title}</h1>
        {/* Metadata in the mono voice, at full contrast. Kind and date stay on
            one line; tags get their own so a wrapped separator never leads. */}
        <div className="mt-4 flex items-baseline gap-x-2">
          <span className="label label-strong">{type}</span>
          <span aria-hidden="true" className="label">
            ·
          </span>
          <time className="label" dateTime={date}>
            {date}
          </time>
        </div>
        {tags.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            {tags.map((tag) => (
              <li key={tag}>
                <Link
                  to={`/${type}`}
                  search={{ tag }}
                  className="label block px-1 py-1.5 text-2xs tracking-[0.06em] no-underline transition-colors hover:text-ink hover:underline"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose">
        <Component components={mdxComponents} />
      </div>

      {/* Keyed to the slug: moving between two posts reuses this component, so
          without it the peek would keep listening to the previous post's
          markers, which are no longer in the document. */}
      <ReferencePeek key={slug} containerRef={articleRef} />

      <section aria-label="Comments" className="mt-16 border-t border-rule pt-8">
        <h2 className="label mb-6">comments</h2>
        <Giscus
          id="comments"
          repo="ggoggam/ggoggam.github.io"
          repoId="R_kgDOKvkuXQ"
          category="General"
          categoryId="DIC_kwDOKvkuXc4Cjadh"
          mapping="pathname"
          reactionsEnabled="0"
          emitMetadata="0"
          theme={pref === "system" ? "preferred_color_scheme" : pref}
          loading="lazy"
        />
      </section>
    </article>
  );
}
