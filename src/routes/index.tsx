import { createFileRoute, Link } from "@tanstack/react-router";
import { getRecentPosts } from "@/lib/posts";
import { AboutFragment } from "@/components/about-fragment";
import DitheredText from "@/components/dithered-text";
import { useNavHover } from "@/components/site/nav-hover-context";

export const Route = createFileRoute("/")({
  loader: () => getRecentPosts(),
  component: HomePage,
});

const NAV_TEXT: Record<string, string> = {
  home: "맞이글",
  blog: "긴글",
  til: "짧은글",
  about: "소개글",
};

function HomePage() {
  const posts = Route.useLoaderData();
  const { hovered } = useNavHover();
  const ditherText = (hovered ? NAV_TEXT[hovered] : null) ?? "맞이글";
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <DitheredText
          text={ditherText}
          height={256}
          fontSize={180}
          fontFamily="sans-serif"
          fontWeight={900}
          pointSpacing={2}
          dotScale={0.85}
          dither="atkinson"
          dotColor={[138, 143, 152]}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-8">Recent</h2>
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
    </div>
  );
}
