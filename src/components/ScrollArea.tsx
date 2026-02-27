'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LuRefreshCw } from 'react-icons/lu'

const PULL_THRESHOLD = 64
const PULL_MAX = 80

export function ScrollArea({
  children,
  storageKey,
  refreshable,
}: {
  children: React.ReactNode
  storageKey: string
  refreshable?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const rafRef = useRef<number | null>(null)
  const prevScrollRef = useRef(0)

  // Pull-to-refresh state
  const pullStartY = useRef<number | null>(null)
  const [pullY, setPullY] = useState(0)

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

  function onTouchStart(e: React.TouchEvent) {
    if (!refreshable) return
    if (ref.current && ref.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!refreshable || pullStartY.current === null) return
    const delta = e.touches[0].clientY - pullStartY.current
    if (delta > 0) {
      setPullY(Math.min(delta * 0.5, PULL_MAX))
    }
  }

  function onTouchEnd() {
    if (!refreshable) return
    if (pullY >= PULL_THRESHOLD) {
      window.location.reload()
    } else {
      pullStartY.current = null
      setPullY(0)
    }
  }

  const isPulledEnough = pullY >= PULL_THRESHOLD

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 overflow-y-auto relative"
    >
      {/* Pull-to-refresh indicator */}
      {refreshable && pullY > 0 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity"
          style={{ top: pullY - 36, opacity: pullY / PULL_MAX }}
        >
          <div
            className={`w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center ${
              isPulledEnough ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
            }`}
          >
            <LuRefreshCw
              size={18}
              className={isPulledEnough ? 'animate-spin' : ''}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
