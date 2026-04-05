import { createFileRoute } from "@tanstack/react-router";
import PostPreview from "@/components/post/post-preview-home";
import { getRecentPosts } from "@/lib/posts";

export const Route = createFileRoute("/")({
  loader: () => getRecentPosts(),
  component: HomePage,
});

function HomePage() {
  const posts = Route.useLoaderData();
  return (
    <div className="grid gap-6 md:grid-cols-2 relative z-20" style={{ mixBlendMode: "normal" }}>
      {posts.map((post) => (
        <PostPreview key={post.slug} {...post} />
      ))}
    </div>
  );
}
