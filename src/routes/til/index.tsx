import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PostList from "@/components/post/post-list";
import { getTILPosts } from "@/lib/posts";

type TILSearch = {
  tag?: string;
};

export const Route = createFileRoute("/til/")({
  validateSearch: (search: Record<string, unknown>): TILSearch => ({
    tag: typeof search.tag === "string" ? search.tag : undefined,
  }),
  loader: () => getTILPosts(),
  component: TILPage,
});

function TILPage() {
  const posts = Route.useLoaderData();
  const { tag } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <PostList
      posts={posts}
      selectedTag={tag}
      onTagChange={(newTag) => navigate({ to: "/til", search: newTag ? { tag: newTag } : {} })}
    />
  );
}
