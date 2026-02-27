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

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const saved = sessionStorage.getItem(`scroll:${storageKey}:${pathname}`)
    if (saved) el.scrollTop = parseInt(saved, 10)
  }, [pathname, storageKey])

  const handleScroll = useCallback(() => {
    if (!ref.current) return
    sessionStorage.setItem(
      `scroll:${storageKey}:${pathname}`,
      String(ref.current.scrollTop),
    )
  }, [pathname, storageKey])

  return (
    <div ref={ref} onScroll={handleScroll} className="flex-1 overflow-y-auto">
      {children}
    </div>
  )
}
