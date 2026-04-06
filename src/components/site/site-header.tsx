import { Link, useRouterState } from "@tanstack/react-router";

export default function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const linkClass = (path: string) => {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return active ? "text-gray-900 font-semibold" : "text-gray-400";
  };

  return (
    <nav className="max-w-2xl w-full mx-auto px-6 pt-12 pb-4">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-xl font-black tracking-tight no-underline text-gray-900 hover:text-gray-900"
        >
          꼬깜
        </Link>
        <div className="flex gap-4 text-sm">
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
