import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEvent, updateEvent } from '@/lib/actions/events'
import { EventForm } from '@/components/EventForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditEventPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const action = async (formData: FormData) => {
    'use server'
    await updateEvent(id, formData)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Editar evento</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <EventForm action={action} defaultValues={event} />
        </div>
      </div>
    </main>
  )
}
