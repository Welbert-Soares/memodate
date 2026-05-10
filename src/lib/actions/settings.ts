'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getWhatsappSettings(): Promise<{
  phone: string | null
  apiKey: string | null
}> {
  const session = await auth()
  if (!session?.user?.id) return { phone: null, apiKey: null }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { whatsappPhone: true, whatsappApiKey: true },
  })

  return { phone: user?.whatsappPhone ?? null, apiKey: user?.whatsappApiKey ?? null }
}

export async function updateWhatsappSettings(
  phone: string,
  apiKey: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'Não autenticado' }

  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { ok: false, error: 'Número de telefone inválido' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      whatsappPhone: cleanPhone,
      whatsappApiKey: apiKey.trim(),
    },
  })

  return { ok: true }
}

export async function removeWhatsappSettings(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.user.update({
    where: { id: session.user.id },
    data: { whatsappPhone: null, whatsappApiKey: null },
  })
}
