import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/lib/actions/events'
import { prisma } from '@/lib/prisma'
import { LuChevronRight } from 'react-icons/lu'
import { TimezoneSelector } from '@/components/TimezoneSelector'

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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
          {/* Avatar + info */}
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
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {session.user?.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {session.user?.email}
              </p>
            </div>
            <div className="flex gap-4 mt-1">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {events.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  evento{events.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4">
            <TimezoneSelector current={timezone} />
          </div>

          <Link
            href="/dashboard"
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3.5 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700 transition-colors touch-manipulation"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ver todos os eventos
            </span>
            <LuChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3.5 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700 transition-colors touch-manipulation"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Configurações de notificações
            </span>
            <LuChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
          </Link>

          {/* Sign out */}
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
            className="mt-2"
          >
            <button
              type="submit"
              className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm px-4 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-[0.97] transition-all touch-manipulation text-center"
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
