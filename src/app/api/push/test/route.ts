import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
  })

  if (subs.length === 0) {
    return NextResponse.json(
      {
        error: 'Nenhuma assinatura encontrada. Ative as notificações primeiro.',
      },
      { status: 404 },
    )
  }

  const payload = JSON.stringify({
    title: 'Memodate 🗓️',
    body: 'Olá Hanninha! Te amo muito! ❤️. Testando as notificações kkkk.',
  })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      )
      sent++
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode
      if (status === 410 || status === 404) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: sub.endpoint },
        })
      }
    }
  }

  return NextResponse.json({ sent, total: subs.length })
}
