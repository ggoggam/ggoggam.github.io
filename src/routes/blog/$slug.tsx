import { createFileRoute, notFound } from "@tanstack/react-router";
import PostArticle from "@/components/post/post-article";
import { format } from "date-fns";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const modules = import.meta.glob("/content/blog/*.mdx");
    const key = `/content/blog/${params.slug}.mdx`;
    if (!modules[key]) throw notFound();
    const mod = (await modules[key]()) as any;
    const fm = mod.frontmatter;
    if (!fm?.published) throw notFound();
    // Pulled in as its own CSS chunk, and awaited so the math never paints raw.
    if (fm.math) await import("@/lib/katex-css");
    return {
      title: fm.title as string,
      date: format(new Date(fm.date), "yyyy-MM-dd"),
      excerpt: (fm.excerpt as string) ?? "",
      tags: (fm.tags as string[]) ?? [],
      Component: mod.default as React.ComponentType<any>,
    };
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="py-16">
      <h1 className="title-display text-h2">Not found</h1>
      <p className="mt-3 text-ink-muted">
        No post lives at this address. Try the <a href="/blog">blog index</a>.
      </p>
    </div>
  ),
});

function BlogPostPage() {
  const { Component, title, date, tags, excerpt } = Route.useLoaderData();
  const { slug } = Route.useParams();
  useSeo({
    title,
    description: excerpt,
    path: `/blog/${slug}`,
    type: "article",
  });
  return (
    <PostArticle
      slug={slug}
      title={title}
      date={date}
      tags={tags}
      type="blog"
      Component={Component}
    />
  );
}
