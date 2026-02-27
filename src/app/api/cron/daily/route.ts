import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() - days)
  return result
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

function shouldNotifyToday(
  event: { date: Date; daysBeforeAlert: number; recurring: boolean },
  today: Date,
): boolean {
  const d = new Date(event.date)

  if (event.recurring) {
    // Check current year and next year to handle year-boundary cases
    for (const year of [today.getUTCFullYear(), today.getUTCFullYear() + 1]) {
      const occurrence = new Date(
        Date.UTC(year, d.getUTCMonth(), d.getUTCDate()),
      )
      if (sameDay(subtractDays(occurrence, event.daysBeforeAlert), today))
        return true
    }
    return false
  }

  const occurrence = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  )
  return sameDay(subtractDays(occurrence, event.daysBeforeAlert), today)
}

function buildMessage(event: {
  title: string
  daysBeforeAlert: number
}): string {
  const d = event.daysBeforeAlert
  if (d === 0) return `Hoje é ${event.title}!`
  if (d === 1) return `${event.title} é amanhã!`
  return `${event.title} em ${d} dias`
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )

  const events = await prisma.event.findMany({
    include: {
      user: { include: { pushSubscriptions: true } },
    },
  })

  const toNotify = events.filter((e) => shouldNotifyToday(e, today))

  let sent = 0
  let removed = 0

  for (const event of toNotify) {
    const subs = event.user.pushSubscriptions
    if (subs.length === 0) continue

    const payload = JSON.stringify({
      title: 'Memodate 🗓️',
      body: buildMessage(event),
    })

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
          removed++
        }
      }
    }
  }

  return NextResponse.json({
    today: today.toISOString(),
    events: toNotify.length,
    sent,
    removed,
  })
}
