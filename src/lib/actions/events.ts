'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { EventType } from '@/generated/prisma'

export async function getEvents() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'asc' },
  })
}

export async function getEvent(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.event.findFirst({
    where: { id, userId: session.user.id },
  })
}

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const type = formData.get('type') as EventType
  const recurring = formData.get('recurring') === 'true'
  const daysBeforeAlertRaw = parseInt(formData.get('daysBeforeAlert') as string)
  const daysBeforeAlert = Number.isNaN(daysBeforeAlertRaw) ? 1 : daysBeforeAlertRaw
  const notes = (formData.get('notes') as string) || null

  await prisma.event.create({
    data: {
      userId: session.user.id,
      title,
      date: new Date(date),
      type,
      recurring,
      daysBeforeAlert,
      notes,
    },
  })

  revalidatePath('/dashboard')
  redirect('/dashboard?toast=saved')
}

export async function updateEvent(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const type = formData.get('type') as EventType
  const recurring = formData.get('recurring') === 'true'
  const daysBeforeAlertRaw = parseInt(formData.get('daysBeforeAlert') as string)
  const daysBeforeAlert = Number.isNaN(daysBeforeAlertRaw) ? 1 : daysBeforeAlertRaw
  const notes = (formData.get('notes') as string) || null

  const existing = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  })
  if (!existing) redirect('/dashboard')

  await prisma.event.update({
    where: { id },
    data: {
      title,
      date: new Date(date),
      type,
      recurring,
      daysBeforeAlert,
      notes,
    },
  })

  revalidatePath('/dashboard')
  redirect('/dashboard?toast=saved')
}

export async function deleteEvent(id: string) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  await prisma.event.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard')
  redirect('/dashboard?toast=deleted')
}

// Used by undo-delete flow in EventCard (no redirect — just revalidate)
export async function deleteEventById(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.event.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard')
}

export async function updateTimezone(timezone: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timezone },
  })
}
