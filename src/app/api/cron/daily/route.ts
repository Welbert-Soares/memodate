import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

function getTodayInTimezone(tz: string): Date {
  const now = new Date()
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now)
    const y = Number(parts.find((p) => p.type === 'year')!.value)
    const m = Number(parts.find((p) => p.type === 'month')!.value) - 1
    const d = Number(parts.find((p) => p.type === 'day')!.value)
    return new Date(Date.UTC(y, m, d))
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }
}

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

  const users = await prisma.user.findMany({
    include: {
      events: true,
      pushSubscriptions: true,
    },
  })

  let sent = 0
  let removed = 0

  for (const user of users) {
    if (user.pushSubscriptions.length === 0) continue

    const today = getTodayInTimezone(user.timezone)
    const toNotify = user.events.filter((e) => shouldNotifyToday(e, today))

    for (const event of toNotify) {
      const payload = JSON.stringify({
        title: 'Memodate 🗓️',
        body: buildMessage(event),
        tag: `event-${event.id}`,
        url: '/dashboard',
      })

      for (const sub of user.pushSubscriptions) {
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
  }

  return NextResponse.json({ sent, removed })
}
