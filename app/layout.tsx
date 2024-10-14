"use client"

import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { AppProvider, useAppContext } from './context';
import { ArrowUpRight } from "lucide-react";

import "./globals.css";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "TIL",
//   description: "Today I Learned",
// };

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <AppProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AppProvider>
  );
}

function RootLayoutContent({ children }: Readonly<{children: React.ReactNode;}>) {
  const { chosen, setChosen } = useAppContext();

  return (
    <html lang="en">
      <body className={`flex flex-col min-h-screen w-screen max-w-screen-4xl items-center bg-gray-50`}>
        <header className="container py-4 md:py-12">
          <nav className="flex justify-between items-center flex-wrap">
            <Link href="/" className="font-black text-6xl leading-tight tracking-tighter">today i</Link>
            <ul className="flex space-x-8 md:space-x-12 text-md font-semibold">
              <li><Link href="/learned" onMouseEnter={() => setChosen("Learned")} onTouchStart={() => setChosen("Learned")}>learned</Link></li>
              <li><Link href="/wrote" onMouseEnter={() => setChosen("Wrote")} onTouchStart={() => setChosen("Wrote")}>wrote</Link></li>
            </ul>
          </nav>
        </header>
        <main className="container">
          {children}
        </main>
        <footer className={`container mx-auto mt-4 space-y-8 text-neutral-600`}>
            <ul className="text-sm hover:text-neutral-800 flex flex-row space-x-4">
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
