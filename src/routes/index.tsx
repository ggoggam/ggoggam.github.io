import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { getRecentPosts } from "@/lib/posts";

export const Route = createFileRoute("/")({
  loader: () => getRecentPosts(),
  component: HomePage,
});

function HomePage() {
  const posts = Route.useLoaderData();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Recent</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
          >
            <time className="text-sm text-gray-400 shrink-0 tabular-nums">{post.date}</time>
            <Link to={post.url} className="hover:text-gray-600">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
