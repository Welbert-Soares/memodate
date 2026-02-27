import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/lib/actions/events'
import { EventType } from '@/generated/prisma'
import { NotificationPrompt } from '@/components/NotificationPrompt'
import { EventCard } from '@/components/EventCard'
import { Toast } from '@/components/Toast'

const TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  BIRTHDAY: { label: 'Aniversário', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
  ANNIVERSARY: { label: 'Comemoração', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  HOLIDAY: { label: 'Data especial', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  OTHER: { label: 'Outro', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  })
}

function daysUntil(date: Date, recurring: boolean): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)

  if (recurring) {
    let next = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    if (next < today) {
      next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
    }
    return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const rawEvents = await getEvents()
  const events = rawEvents
    .map((e) => ({ ...e, days: daysUntil(e.date, e.recurring) }))
    .sort((a, b) => {
      const aFuture = a.recurring || a.days >= 0
      const bFuture = b.recurring || b.days >= 0
      if (aFuture && !bFuture) return -1
      if (!aFuture && bFuture) return 1
      return a.days - b.days
    })

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Olá, {session.user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {events.length === 0
                ? 'Nenhum evento ainda'
                : `${events.length} evento${events.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Configurações"
            >
              ⚙️
            </Link>
            <Link
              href="/dashboard/events/new"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Novo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="text-5xl">📅</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Adicione seu primeiro evento para começar a receber lembretes.
            </p>
            <Link
              href="/dashboard/events/new"
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Criar evento
            </Link>
          </div>
        ) : (
          events.map((event) => {
            const typeConfig = TYPE_CONFIG[event.type]
            return (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                formattedDate={formatDate(event.date)}
                recurring={event.recurring}
                daysBeforeAlert={event.daysBeforeAlert}
                days={event.days}
                typeLabel={typeConfig.label}
                typeColor={typeConfig.color}
              />
            )
          })
        )}
      </div>
      <NotificationPrompt />
      <Suspense>
        <Toast />
      </Suspense>
    </main>
  )
}
