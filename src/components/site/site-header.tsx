import { Link, useRouterState } from "@tanstack/react-router";
import { hasRecentPost } from "@/lib/posts";

const SECTIONS = [
  { to: "/blog", label: "blog" },
  { to: "/til", label: "til" },
  { to: "/about", label: "about" },
] as const;

export default function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const newIn = SECTIONS.filter(
    (s) => s.to !== "/about" && hasRecentPost(s.to.slice(1) as "blog" | "til")
  ).map((s) => s.label);

  return (
    <nav
      aria-label="Primary"
      className="mx-auto flex w-full max-w-measure items-baseline justify-between gap-6 px-6 pb-5 pt-10 sm:pt-14"
    >
      <Link
        to="/"
        className="relative font-body text-wordmark font-bold tracking-tight text-ink no-underline"
      >
        꼬깜
        {newIn.length > 0 && (
          <>
            <span
              aria-hidden="true"
              className="absolute -right-2.5 -top-0.5 size-[5px] rounded-full bg-accent"
            />
            <span className="sr-only">
              {` — new ${newIn.join(" and ")} ${newIn.length > 1 ? "posts" : "post"}`}
            </span>
          </>
        )}
      </Link>

      <ul className="flex items-baseline gap-1">
        {SECTIONS.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              aria-current={isActive(to) ? "page" : undefined}
              className={`label block px-2 py-2 no-underline transition-colors hover:text-ink ${
                isActive(to) ? "label-strong" : ""
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
