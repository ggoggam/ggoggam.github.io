import { createFileRoute, notFound } from "@tanstack/react-router";
import PostArticle from "@/components/post/post-article";
import { format } from "date-fns";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/til/$slug")({
  loader: async ({ params }) => {
    const modules = import.meta.glob("/content/til/*.mdx");
    const key = `/content/til/${params.slug}.mdx`;
    if (!modules[key]) throw notFound();
    const mod = (await modules[key]()) as any;
    const fm = mod.frontmatter;
    if (!fm?.published) throw notFound();
    return {
      title: fm.title as string,
      date: format(new Date(fm.date), "yyyy-MM-dd"),
      excerpt: (fm.excerpt as string) ?? "",
      tags: (fm.tags as string[]) ?? [],
      Component: mod.default as React.ComponentType<any>,
    };
  },
  component: TILPostPage,
  notFoundComponent: () => <div className="py-8 text-center">Post not found.</div>,
});

function TILPostPage() {
  const { Component, title, date, tags, excerpt } = Route.useLoaderData();
  const { slug } = Route.useParams();
  useSeo({
    title,
    description: excerpt,
    path: `/til/${slug}`,
    type: "article",
  });
  return (
    <PostArticle
      slug={slug}
      title={title}
      date={date}
      tags={tags}
      type="til"
      Component={Component}
    />
  );
}
