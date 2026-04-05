import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import DitheredImage from "@/components/dithered-image";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isHome = pathname === "/";
  const showBackground = (isHome || pathname === "/blog" || pathname === "/til") && !isMobile;

  return (
    <>
      {showBackground && (
        <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <DitheredImage
              src="/ggoggam/ggoggam_1.jpg"
              width={256}
              height={256}
              gridSpacing={1}
              dotScale={0.85}
              dither="atkinson"
              dotColor={[30, 30, 30]}
              className="rounded-xl"
            />
          </div>
        </div>
      )}
      <header className="relative z-10">
        <SiteHeader />
        {isHome && (
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="w-full md:h-[20vh]" />
            <h2 className="text-2xl font-black leading-tight text-gray-50">RECENT POSTS</h2>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 md:px-6 pb-4 md:pb-8 flex-grow relative z-10 justify-center">
        <Outlet />
      </main>
      <Toaster />
      <footer className="bg-gray-50 relative z-10">
        <SiteFooter
          github="https://github.com/ggoggam"
          source="https://github.com/ggoggam/ggoggam.github.io"
        />
      </footer>
    </>
  );
}
