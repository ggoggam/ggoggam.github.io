import { Link, useRouterState } from "@tanstack/react-router";
import { useNavHover } from "@/components/site/nav-hover-context";

export default function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setHovered } = useNavHover();

  const linkClass = (path: string) => {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return active ? "text-gray-900 font-semibold" : "text-gray-400";
  };

  return (
    <nav className="max-w-2xl w-full mx-auto px-6 pt-12 pb-4">
      <div className="flex items-center justify-between gap-6">
        <Link
          to="/"
          className="text-xl font-black tracking-tight no-underline text-gray-900 hover:text-gray-900"
          onPointerEnter={() => setHovered("home")}
          onPointerLeave={() => setHovered(null)}
        >
          ggoggam.
        </Link>
        <div className="flex gap-4 text-sm">
          <Link
            to="/blog"
            className={`no-underline hover:text-gray-900 ${linkClass("/blog")}`}
            onPointerEnter={() => setHovered("blog")}
            onPointerLeave={() => setHovered(null)}
          >
            blog
          </Link>
          <Link
            to="/til"
            className={`no-underline hover:text-gray-900 ${linkClass("/til")}`}
            onPointerEnter={() => setHovered("til")}
            onPointerLeave={() => setHovered(null)}
          >
            til
          </Link>
          <Link
            to="/about"
            className={`no-underline hover:text-gray-900 ${linkClass("/about")}`}
            onPointerEnter={() => setHovered("about")}
            onPointerLeave={() => setHovered(null)}
          >
            about
          </Link>
        </div>
      </div>
    </nav>
  );
}
