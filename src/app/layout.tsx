import './globals.css'
import type { Metadata } from 'next'
import ClientWrapper from '@/app/page-wrapper'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata: Metadata = {
  title: 'TIL',
  description: 'A blog about my learning and thoughts from tinkerings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
      <meta name="google-adsense-account" content="ca-pub-8839205870560100"/>
      <meta name="google-site-verification" content="vCArfISd2m3hx7UroyoWKQ_zRbKwWRid8Yfsg4G9xmI" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.19/dist/katex.min.css"/>
      </head>
      <body className="bg-gray-50 relative flex flex-col min-h-screen">
        <ClientWrapper>
            {children}
        </ClientWrapper>
      </body>
    </html>
  )
}

