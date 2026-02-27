import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/lib/actions/events'
import { prisma } from '@/lib/prisma'
import {
  LuChevronRight,
  LuCalendarDays,
  LuBell,
  LuClock,
  LuLogOut,
} from 'react-icons/lu'
import { TimezoneSelector } from '@/components/TimezoneSelector'
import { ScrollArea } from '@/components/ScrollArea'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [events, user] = await Promise.all([
    getEvents(),
    prisma.user.findUnique({
      where: { id: session.user!.id! },
      select: { timezone: true },
    }),
  ])

  const timezone = user?.timezone ?? 'America/Sao_Paulo'

  const now = new Date()
  const upcomingCount = events.filter((e) => {
    const d = new Date(e.date)
    const diff = Math.ceil(
      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    return diff >= 0 && diff <= 30
  }).length

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div
        className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Perfil
          </h1>
        </div>
      </div>

      <ScrollArea storageKey="profile">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

          {/* Avatar card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-6 py-6 flex flex-col items-center gap-3">
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="w-20 h-20 rounded-full ring-4 ring-indigo-100 dark:ring-indigo-900/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {session.user?.name?.[0] ?? '?'}
              </div>
            )}
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-snug">
                {session.user?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {session.user?.email}
              </p>
            </div>

            {/* Stats row */}
            <div className="w-full mt-1 pt-4 border-t border-gray-100 dark:border-gray-700 flex divide-x divide-gray-100 dark:divide-gray-700">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {events.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  evento{events.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {upcomingCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  próximos 30 dias
                </p>
              </div>
            </div>
          </div>

          {/* Preferences section */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1">
              Preferências
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <LuClock size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fuso horário
                  </p>
                </div>
                <TimezoneSelector current={timezone} />
              </div>
            </div>
          </div>

          {/* Navigation section */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1">
              Atalhos
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              <Link
                href="/dashboard"
                className="px-4 py-4 flex items-center gap-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <LuCalendarDays size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ver todos os eventos
                </span>
                <LuChevronRight size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="px-4 py-4 flex items-center gap-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors touch-manipulation"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <LuBell size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Configurações de notificações
                </span>
                <LuChevronRight size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Danger zone */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1">
              Conta
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button
                  type="submit"
                  className="w-full px-4 py-4 flex items-center gap-3 active:bg-red-50 dark:active:bg-red-900/10 transition-colors touch-manipulation"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <LuLogOut size={16} className="text-red-500 dark:text-red-400" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-red-500 dark:text-red-400">
                    Sair da conta
                  </span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  )
}
