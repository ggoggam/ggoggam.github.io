import { createFileRoute } from "@tanstack/react-router";
import PostList from "@/components/post/post-list";
import { getTILPosts } from "@/lib/posts";

export const Route = createFileRoute("/til/")({
  loader: () => getTILPosts(),
  component: TILPage,
});

function TILPage() {
  const posts = Route.useLoaderData();
  return <PostList posts={posts} />;
}
