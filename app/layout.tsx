import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import { Separator } from "@/components/ui/separator";

const geistSans = localFont({
  src: "./fonts/Geist.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardStd-Black.woff2",
      weight: '900',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-ExtraBold.woff2",
      weight: '800',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-Bold.woff2",
      weight: '700',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-SemiBold.woff2",
      weight: '600',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-Medium.woff2",
      weight: '500',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-Regular.woff2",
      weight: '400',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-Light.woff2",
      weight: '300',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-ExtraLight.woff2",
      weight: '200',
      style: 'normal'
    },
    {
      path: "./fonts/PretendardStd-Thin.woff2",
      weight: '100',
      style: 'normal'
    }
  ],
  variable: '--font-pretendard'
})

export const metadata: Metadata = {
  title: "TIL",
  description: "Today I Learned",
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`antialiased flex flex-col min-h-full`}>
        <header className="">
          <nav className="container mx-auto px-32 py-16 flex justify-between items-center flex-wrap">
            <Link href="/" className="text-6xl font-black">TIL</Link>
            <ul className="flex space-x-8">
              <li><Link href="/til" className="font-bold">til</Link></li>
              <li><Link href="/blog" className="font-bold">blog</Link></li>
              <li><Link href="/about" className="font-bold">about</Link></li>
            </ul>
          </nav>
        </header>
        <main className="flex-grow container mx-auto px-8 py-4">
          {children}
        </main>
        <footer className="mt-auto">
          <div className="container mx-auto px-4 py-8 text-center text-xs">
            Created by ggoggam. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
