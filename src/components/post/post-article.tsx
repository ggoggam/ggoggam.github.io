import Giscus from "@giscus/react";
import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/mdx-component";

export type PostArticleProps = {
  slug: string;
  title: string;
  date: string;
  Component: React.ComponentType<{ components?: MDXComponents }>;
};

export default function PostArticle({ slug: _slug, title, date, Component }: PostArticleProps) {
  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
        <time className="text-sm text-gray-400" dateTime={date}>
          {date}
        </time>
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
        reactionsEnabled="1"
        emitMetadata="0"
        theme="light_high_contrast"
        loading="lazy"
      />
    </article>
  );
}
