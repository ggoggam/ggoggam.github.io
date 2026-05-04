import { createRootRoute, Outlet } from "@tanstack/react-router";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import { NavHoverProvider } from "@/components/site/nav-hover-context";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <NavHoverProvider>
      <div className="min-h-screen flex flex-col">
        <header>
          <SiteHeader />
        </header>
        <main className="max-w-2xl w-full mx-auto px-6 py-8 flex-grow">
          <Outlet />
        </main>
        <footer className="border-t">
          <SiteFooter
            github="https://github.com/ggoggam"
            source="https://github.com/ggoggam/ggoggam.github.io"
          />
        </footer>
      </div>
    </NavHoverProvider>
  );
}
