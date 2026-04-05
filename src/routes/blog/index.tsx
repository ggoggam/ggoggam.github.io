import { createFileRoute } from "@tanstack/react-router";
import PostList from "@/components/post/post-list";
import { getBlogPosts } from "@/lib/posts";

export const Route = createFileRoute("/blog/")({
  loader: () => getBlogPosts(),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();
  return <PostList posts={posts} />;
}
