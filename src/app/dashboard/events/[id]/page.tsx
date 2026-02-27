import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEvent } from '@/lib/actions/events'
import { EventType } from '@/generated/prisma'
import {
  LuArrowLeft,
  LuPencil,
  LuCalendarDays,
  LuBell,
  LuRepeat2,
  LuStickyNote,
} from 'react-icons/lu'
import { DeleteEventButton } from '@/components/DeleteEventButton'

type Props = { params: Promise<{ id: string }> }

const TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  BIRTHDAY: {
    label: 'Aniversário',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  },
  ANNIVERSARY: {
    label: 'Comemoração',
    color:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  HOLIDAY: {
    label: 'Data especial',
    color:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  OTHER: {
    label: 'Outro',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  },
}

function formatFullDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function alertLabel(days: number) {
  if (days === 0) return 'No dia do evento'
  if (days === 1) return '1 dia antes'
  if (days === 7) return '1 semana antes'
  if (days === 14) return '2 semanas antes'
  if (days === 30) return '1 mês antes'
  return `${days} dias antes`
}

export default async function EventDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const typeConfig = TYPE_CONFIG[event.type]

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LuArrowLeft size={22} />
          </Link>
          <h1 className="flex-1 text-xl font-bold text-gray-900 dark:text-gray-100">
            Evento
          </h1>
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="rounded-xl p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
          >
            <LuPencil size={20} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
          {/* Title card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-5 py-5">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeConfig.color}`}
            >
              {typeConfig.label}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {event.title}
            </h2>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            {/* Date */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuCalendarDays
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Data
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize mt-0.5">
                  {formatFullDate(event.date)}
                </p>
              </div>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuRepeat2
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Repetição
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                  {event.recurring ? 'Repete todo ano' : 'Não repete'}
                </p>
              </div>
            </div>

            {/* Reminder */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuBell
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Lembrete
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                  {alertLabel(event.daysBeforeAlert)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 mt-0.5">
                <LuStickyNote
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Notas
                </p>
                {event.notes ? (
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {event.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 italic">
                    Nenhuma nota adicionada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="mt-2">
            <DeleteEventButton id={event.id} title={event.title} />
          </div>
        </div>
      </div>
    </div>
  )
}
