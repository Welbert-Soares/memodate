import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getEvents, deleteEvent } from '@/lib/actions/events'
import { EventType } from '@/generated/prisma'
import { PushSubscribeButton } from '@/components/PushSubscribeButton'

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

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const events = await getEvents()

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
            <div className="mt-1.5">
              <PushSubscribeButton />
            </div>
          </div>
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Novo
          </Link>
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
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {event.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatDate(event.date)}
                    {event.recurring && ' · repete todo ano'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Lembrete:{' '}
                    {event.daysBeforeAlert === 0
                      ? 'no dia'
                      : `${event.daysBeforeAlert} dia${event.daysBeforeAlert > 1 ? 's' : ''} antes`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      'use server'
                      await deleteEvent(event.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
