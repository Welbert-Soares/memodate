'use client'

import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div
      key={pathname}
      style={{ animation: 'pageEnter 220ms ease-out both' }}
      className="flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      {children}
    </div>
  )
}
