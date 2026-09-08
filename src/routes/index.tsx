import { createFileRoute } from "@tanstack/react-router";
import { getRecentPosts } from "@/lib/posts";
import { ArtGallery } from "@/components/art-gallery";
import PostPreview from "@/components/post/post-preview";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({ loader: () => getRecentPosts(), component: HomePage });

function HomePage() {
  const posts = Route.useLoaderData();
  useSeo({ description: "A blog about software engineering, machine learning, and more." });

  return (
    <div>
      <h1 className="sr-only">꼬깜</h1>
      <ArtGallery />
      <section aria-labelledby="recent">
        <h2 id="recent" className="section-heading">
          recent
        </h2>
        <ul className="post-feed" aria-label="Recent writing">
          {posts.map((post) => (
            <PostPreview key={post.url} {...post} showType />
          ))}
        </ul>
      </section>
    </div>
  );
}
