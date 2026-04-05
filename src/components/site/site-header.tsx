import { Link, useRouterState } from "@tanstack/react-router";

export default function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBlog = pathname.includes("blog");
  const blogTextColor = isBlog ? "text-gray-50" : "text-gray-950";
  const tilTextColor = isBlog ? "text-gray-950" : "text-gray-50";

  return (
    <nav className="container mx-auto px-4 py-4 text-2xl md:text-4xl lg:text-6xl xl:text-8xl leading-tight tracking-tighter">
      <ul className="flex space-x-2 md:space-x-4">
        <li>
          <Link to="/" className="font-black text-gray-50">
            TODAY I
          </Link>
        </li>
        <li>
          <Link to="/til" className={`font-black ${tilTextColor} hover:text-gray-50`}>
            LEARNED
          </Link>
        </li>
        <li>
          <Link to="/blog" className={`font-black ${blogTextColor} hover:text-gray-50`}>
            WROTE
          </Link>
        </li>
      </ul>
    </nav>
  );
}
