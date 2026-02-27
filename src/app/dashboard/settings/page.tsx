import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { NotificationToggle } from '@/components/NotificationToggle'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Configurações
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
        {/* Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4 flex items-center gap-4">
          {session.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? ''}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {session.user?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {session.user?.email}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Notificações
          </p>
          <NotificationToggle />
        </div>

        {/* Sign out */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-4 text-sm font-medium text-red-500 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-2xl"
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
