import { Link, useRouterState } from "@tanstack/react-router";
import { hasRecentPost } from "@/lib/posts";

export default function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const linkClass = (path: string) => {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return active ? "text-gray-900" : "text-gray-400";
  };

  const hasNew = hasRecentPost("blog") || hasRecentPost("til");

  return (
    <nav className="max-w-2xl w-full mx-auto px-6 pt-12 pb-4 font-mono">
      <div className="flex items-center justify-between gap-6">
        <Link
          to="/"
          className="relative text-xl font-black tracking-tight no-underline text-gray-900 hover:text-gray-900"
        >
          꼬깜
          {hasNew && (
            <span className="absolute -top-0.5 -right-2.5 size-2 rounded-full bg-red-500" />
          )}
        </Link>
        <div className="flex gap-4 text-sm font-semibold">
          <Link to="/blog" className={`no-underline hover:text-gray-900 ${linkClass("/blog")}`}>
            blog
          </Link>
          <Link to="/til" className={`no-underline hover:text-gray-900 ${linkClass("/til")}`}>
            til
          </Link>
          <Link to="/about" className={`no-underline hover:text-gray-900 ${linkClass("/about")}`}>
            about
          </Link>
        </div>
      </div>
    </nav>
  );
}
