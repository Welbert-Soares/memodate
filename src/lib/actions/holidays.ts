'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { seedHolidaysForUser } from '@/lib/holidays'

export async function importHolidays(): Promise<{ created: number }> {
  const session = await auth()
  if (!session?.user?.id) return { created: 0 }

  const created = await seedHolidaysForUser(session.user.id)

  if (created > 0) revalidatePath('/dashboard')

  return { created }
}
