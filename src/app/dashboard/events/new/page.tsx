import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createEvent } from '@/lib/actions/events'
import { EventForm } from '@/components/EventForm'
import { LuArrowLeft } from 'react-icons/lu'

export default async function NewEventPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90 transition-all touch-manipulation"
          >
            <LuArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Novo evento
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <EventForm action={createEvent} />
          </div>
        </div>
      </div>
    </div>
  )
}
