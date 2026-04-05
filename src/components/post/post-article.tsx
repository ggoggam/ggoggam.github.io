import Giscus from "@giscus/react";
import type { MDXComponents } from "mdx/types";
import { CustomMDXComponents } from "@/components/mdx-component";

export type PostArticleProps = {
  slug: string;
  title: string;
  date: string;
  Component: React.ComponentType<{ components?: MDXComponents }>;
};

export default function PostArticle({ slug: _slug, title, date, Component }: PostArticleProps) {
  return (
    <article className="max-w-3xl mx-auto py-4 md:py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2">{title.toUpperCase()}</h1>
        <time className="text-gray-500" dateTime={date}>
          {date}
        </time>
      </header>
      <div className="prose lg:prose-xl mb-8">
        <Component components={CustomMDXComponents({})} />
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
