'use client'

import { useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollArea({
  children,
  storageKey,
}: {
  children: React.ReactNode
  storageKey: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const rafRef = useRef<number | null>(null)
  const prevScrollRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const saved = sessionStorage.getItem(`scroll:${storageKey}:${pathname}`)
    if (saved) el.scrollTop = parseInt(saved, 10)
  }, [pathname, storageKey])

  const handleScroll = useCallback(() => {
    if (!ref.current) return

    // Scroll direction — dispatch event for BottomNav
    const current = ref.current.scrollTop
    const direction = current > prevScrollRef.current ? 'down' : 'up'
    prevScrollRef.current = current
    window.dispatchEvent(new CustomEvent('scrolldir', { detail: { direction } }))

    // Throttle sessionStorage writes with rAF
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        sessionStorage.setItem(
          `scroll:${storageKey}:${pathname}`,
          String(ref.current.scrollTop),
        )
      }
      rafRef.current = null
    })
  }, [pathname, storageKey])

  return (
    <div ref={ref} onScroll={handleScroll} className="flex-1 overflow-y-auto">
      {children}
    </div>
  )
}
