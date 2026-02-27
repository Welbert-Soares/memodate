import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createEvent } from '@/lib/actions/events'
import { EventForm } from '@/components/EventForm'

export default async function NewEventPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Novo evento</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <EventForm action={createEvent} />
        </div>
      </div>
    </main>
  )
}
