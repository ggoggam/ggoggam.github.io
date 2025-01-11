import './globals.css'
import type { Metadata } from 'next'
import ClientWrapper from '@/app/page-wrapper'

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
    <html lang="en">
      <head>
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

