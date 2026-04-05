import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PostList from "@/components/post/post-list";
import { getBlogPosts } from "@/lib/posts";

type BlogSearch = {
  tag?: string;
};

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    tag: typeof search.tag === "string" ? search.tag : undefined,
  }),
  loader: () => getBlogPosts(),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();
  const { tag } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <PostList
      posts={posts}
      selectedTag={tag}
      onTagChange={(newTag) => navigate({ to: "/blog", search: newTag ? { tag: newTag } : {} })}
    />
  );
}
