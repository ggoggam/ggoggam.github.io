'use client'

import { usePathname } from 'next/navigation'
import MetaballsAnimation from '@/components/metaball'
import SiteHeader from '@/components/site/site-header'
import SiteFooter from '@/components/site/site-footer'
import { Toaster } from '@/components/ui/toaster'
import { useState, useEffect } from 'react'

export default function ClientWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pathname = usePathname()
  const isHome = pathname === '/'
  const showBackground = (isHome || pathname === '/blog' || pathname === '/til') && !isMobile

  // apply overlap-text only when metaballs are shown
  return (
    <>
      {showBackground && <MetaballsAnimation />}
      <header className={`relative z-10 overlap-metaball`}>
        <SiteHeader/>
        {isHome && 
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="w-full md:h-[25vh]" />
            <h2 className="text-2xl font-black leading-tight text-gray-50">
              RECENT POSTS
            </h2>
          </div>
        }
      </header>
      <main className={`container mx-auto px-4 md:px-6 pb-4 md:pb-8 flex-grow relative z-10`}>
        {children}
      </main>
      <Toaster/>
      <footer className="bg-gray-50 relative z-10">
        <SiteFooter 
          github='https://github.com/ggoggam'
          source="https://github.com/ggoggam/ggoggam.github.io"/>
      </footer>
    </>
  )
}