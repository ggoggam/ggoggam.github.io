import { createRootRoute, Outlet } from "@tanstack/react-router";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <a
        href="#content"
        className="label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:no-underline"
      >
        skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <SiteHeader />
        </header>
        <main id="content" className="mx-auto w-full max-w-measure flex-grow px-6 py-10 sm:py-14">
          <Outlet />
        </main>
        <footer className="border-t">
          <SiteFooter
            github="https://github.com/ggoggam"
            source="https://github.com/ggoggam/ggoggam.github.io"
          />
        </footer>
      </div>
    </>
  );
}
