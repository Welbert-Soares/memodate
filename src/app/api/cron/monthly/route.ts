import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@/generated/prisma'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const TYPE_EMOJI: Record<EventType, string> = {
  BIRTHDAY: '🎂',
  ANNIVERSARY: '🎉',
  HOLIDAY: '📅',
  OTHER: '📌',
}

function getMonthEvents(
  events: { title: string; date: Date; type: EventType; recurring: boolean }[],
  month: number,
  year: number,
) {
  return events
    .filter((e) => {
      const d = new Date(e.date)
      if (e.recurring) return d.getUTCMonth() === month
      return d.getUTCMonth() === month && d.getUTCFullYear() === year
    })
    .sort((a, b) => new Date(a.date).getUTCDate() - new Date(b.date).getUTCDate())
}

function buildMessage(
  events: { title: string; date: Date; type: EventType }[],
  month: number,
  year: number,
): string {
  const monthName = MONTH_NAMES[month]
  const lines: string[] = [
    `🗓️ *Memodate – ${monthName} ${year}*`,
    '',
    `Seus eventos este mês:`,
    '',
  ]

  for (const e of events) {
    const day = String(new Date(e.date).getUTCDate()).padStart(2, '0')
    lines.push(`${TYPE_EMOJI[e.type]} ${day}/${String(month + 1).padStart(2, '0')} – ${e.title}`)
  }

  lines.push('')
  lines.push(
    events.length === 1
      ? '1 evento em ' + monthName.toLowerCase() + '. Bom mês! 🌟'
      : `${events.length} eventos em ${monthName.toLowerCase()}. Bom mês! 🌟`,
  )

  return lines.join('\n')
}

async function sendWhatsapp(phone: string, apiKey: string, message: string): Promise<boolean> {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
  const res = await fetch(url)
  return res.ok
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()

  const users = await prisma.user.findMany({
    where: {
      whatsappPhone: { not: null },
      whatsappApiKey: { not: null },
    },
    include: { events: true },
  })

  let sent = 0
  let failed = 0

  for (const user of users) {
    const monthEvents = getMonthEvents(user.events, month, year)
    if (monthEvents.length === 0) continue

    const message = buildMessage(monthEvents, month, year)
    const ok = await sendWhatsapp(user.whatsappPhone!, user.whatsappApiKey!, message)
    if (ok) sent++
    else failed++
  }

  return NextResponse.json({ sent, failed })
}
