import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import "./globals.css";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const metadata: Metadata = {
  title: "TIL",
  description: "Today I Learned",
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <RootLayoutContent>{children}</RootLayoutContent>
  );
}

function RootLayoutContent({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} flex flex-col min-h-screen md:screen-width-2xl justify-center items-center bg-gray-50`}>
        <header className="container py-2 md:py-12 px-2 md:px-8">
          <nav className="flex justify-between items-center flex-wrap">
            <Link href="/" className="font-black text-4xl md:text-6xl leading-tight tracking-tighter">
              TODAY I
            </Link>
            <ul className="flex space-x-8 text-md md:text-lg font-black">
              <li>
                <Link href="/learned">LEARNED</Link>
              </li>
              <li>
                <Link href="/thought">THOUGHT</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container" style={{ minHeight: "0.7vh" }}>
          {children}
        </main>
        <footer className={`container mt-4 space-y-8 text-neutral-600 px-2 md:px-8`}>
            <ul className="text-xs md:text-sm hover:text-neutral-800 flex flex-row space-x-4">
                <li>
                    <Link className="flex items-center transition-all gap-x-1" rel="noreferrer noopener" href="/about">
                        <ArrowUpRight/>
                        about
                    </Link>
                </li>   

                <li>
                    <Link className="flex items-center transition-all gap-x-1" rel="noreferrer noopener" href="/rss">
                        <ArrowUpRight/> 
                        rss
                    </Link>
                </li>

                <li>
                    <Link className="flex items-center transition-all gap-x-1" rel="noreferrer noopener" href="https://github.com/ggoggam">
                    <ArrowUpRight/> 
                    github
                    </Link>
                </li>

                <li>
                    <Link className="flex items-center transition-all gap-x-1" rel="noreferrer noopener" href="https://github.com/ggoggam/ggoggam.github.io">
                        <ArrowUpRight/>
                        source
                    </Link>
                </li>            
            </ul>
            <p className="text-xs text-center">
                © {new Date().getFullYear()} MIT Licensed. Created by gggogam.
            </p>
        </footer>
      </body>
    </html>
  );
}
