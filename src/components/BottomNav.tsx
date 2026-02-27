'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LuHouse, LuCirclePlus, LuSettings2 } from 'react-icons/lu'

export function BottomNav() {
  const pathname = usePathname()

  const isHome = pathname === '/dashboard'
  const isNew = pathname.startsWith('/dashboard/events')
  const isSettings = pathname === '/dashboard/settings'

  return (
    <nav
      className="shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors active:opacity-60 touch-manipulation ${isHome ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <LuHouse size={22} strokeWidth={isHome ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Início</span>
        </Link>

        <Link
          href="/dashboard/events/new"
          className={`flex items-center justify-center w-20 h-full transition-colors active:scale-90 touch-manipulation ${isNew ? 'text-indigo-700 dark:text-indigo-400' : 'text-indigo-500 dark:text-indigo-400'}`}
        >
          <LuCirclePlus size={34} strokeWidth={isNew ? 2.5 : 2} />
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex flex-col items-center justify-center gap-0.5 w-20 h-full transition-colors active:opacity-60 touch-manipulation ${isSettings ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <LuSettings2 size={22} strokeWidth={isSettings ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Config.</span>
        </Link>
      </div>
    </nav>
  )
}
