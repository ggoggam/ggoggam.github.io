import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reading = /^\/(blog|til)\/[^/]+/.test(pathname) || pathname === "/about";

  return (
    <>
      <a
        href="#content"
        className="label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:no-underline"
      >
        skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <header className="site-header">
          <SiteHeader />
        </header>
        <main id="content" className={`site-main${reading ? " site-main-reading" : ""}`}>
          <Outlet />
        </main>
        <footer className="site-footer">
          <SiteFooter
            github="https://github.com/ggoggam"
            source="https://github.com/ggoggam/ggoggam.github.io"
          />
        </footer>
      </div>
    </>
  );
}
