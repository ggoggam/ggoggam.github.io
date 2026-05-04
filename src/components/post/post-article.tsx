import Giscus from "@giscus/react";
import { Link } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/mdx-component";

export type PostArticleProps = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  type: "blog" | "til";
  Component: React.ComponentType<{ components?: MDXComponents }>;
};

export default function PostArticle({
  slug: _slug,
  title,
  date,
  tags,
  type,
  Component,
}: PostArticleProps) {
  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
        <time className="text-sm text-gray-400" dateTime={date}>
          {date}
        </time>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/${type}`}
                search={{ tag }}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors no-underline"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div className="prose lg:prose-lg mb-12">
        <Component components={mdxComponents} />
      </div>
      <Giscus
        id="comments"
        repo="ggoggam/ggoggam.github.io"
        repoId="R_kgDOKvkuXQ"
        category="General"
        categoryId="DIC_kwDOKvkuXc4Cjadh"
        mapping="pathname"
        reactionsEnabled="0"
        emitMetadata="0"
        theme="https://ggoggam.github.io/giscus-theme.css"
        loading="lazy"
      />
    </article>
  );
}
