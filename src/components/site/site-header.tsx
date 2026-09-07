import { Link, useRouterState } from "@tanstack/react-router";

const SECTIONS = [
  { to: "/blog", label: "blog" },
  { to: "/til", label: "til" },
  { to: "/about", label: "about" },
] as const;

export default function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Primary" className="site-nav">
      <Link to="/" className="wordmark" aria-current={pathname === "/" ? "page" : undefined}>
        꼬깜
      </Link>
      <ul className="nav-links">
        {SECTIONS.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              aria-current={pathname === to || pathname.startsWith(to + "/") ? "page" : undefined}
              className="nav-link"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
