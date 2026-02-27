import { prisma } from '@/lib/prisma'
import { EventType } from '@/generated/prisma'

type HolidayDef = {
  title: string
  month: number
  day: number
  year?: number // only for moveable feasts
  recurring: boolean
  daysBeforeAlert: number
  notes?: string
}

// Feriados fixos — mesma data todo ano
const FIXED_HOLIDAYS: HolidayDef[] = [
  { title: 'Ano Novo', month: 1, day: 1, recurring: true, daysBeforeAlert: 1 },
  {
    title: 'Dia Internacional da Mulher',
    month: 3,
    day: 8,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Tiradentes',
    month: 4,
    day: 21,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Dia do Trabalho',
    month: 5,
    day: 1,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Dia dos Namorados',
    month: 6,
    day: 12,
    recurring: true,
    daysBeforeAlert: 7,
  },
  {
    title: 'Festa Junina',
    month: 6,
    day: 24,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Independência do Brasil',
    month: 9,
    day: 7,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Nossa Senhora Aparecida',
    month: 10,
    day: 12,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Dia das Crianças',
    month: 10,
    day: 12,
    recurring: true,
    daysBeforeAlert: 7,
  },
  {
    title: 'Finados',
    month: 11,
    day: 2,
    recurring: true,
    daysBeforeAlert: 1,
  },
  {
    title: 'Proclamação da República',
    month: 11,
    day: 15,
    recurring: true,
    daysBeforeAlert: 1,
  },
  { title: 'Natal', month: 12, day: 25, recurring: true, daysBeforeAlert: 7 },
  {
    title: 'Réveillon',
    month: 12,
    day: 31,
    recurring: true,
    daysBeforeAlert: 1,
  },
]

// Datas móveis de 2026 — mudam a cada ano
const MOVEABLE_HOLIDAYS_2026: HolidayDef[] = [
  {
    title: 'Carnaval',
    month: 2,
    day: 17,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 7,
    notes: 'Data móvel — varia a cada ano.',
  },
  {
    title: 'Sexta-feira Santa',
    month: 4,
    day: 3,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 1,
    notes: 'Data móvel — varia a cada ano.',
  },
  {
    title: 'Páscoa',
    month: 4,
    day: 5,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 7,
    notes: 'Data móvel — varia a cada ano.',
  },
  {
    title: 'Dia das Mães',
    month: 5,
    day: 10,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 7,
    notes: '2º domingo de maio — varia a cada ano.',
  },
  {
    title: 'Corpus Christi',
    month: 6,
    day: 4,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 1,
    notes: 'Data móvel — varia a cada ano.',
  },
  {
    title: 'Dia dos Pais',
    month: 8,
    day: 9,
    year: 2026,
    recurring: false,
    daysBeforeAlert: 7,
    notes: '2º domingo de agosto — varia a cada ano.',
  },
]

const ALL_HOLIDAYS = [...FIXED_HOLIDAYS, ...MOVEABLE_HOLIDAYS_2026]

export async function seedHolidaysForUser(userId: string): Promise<number> {
  const existing = await prisma.event.findMany({
    where: { userId, type: EventType.HOLIDAY },
    select: { title: true },
  })

  const existingTitles = new Set(existing.map((e) => e.title))
  const toCreate = ALL_HOLIDAYS.filter((h) => !existingTitles.has(h.title))

  if (toCreate.length === 0) return 0

  const currentYear = new Date().getFullYear()

  await prisma.event.createMany({
    data: toCreate.map((h) => {
      const year = h.year ?? currentYear
      return {
        userId,
        title: h.title,
        date: new Date(`${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}T12:00:00.000Z`),
        type: EventType.HOLIDAY,
        recurring: h.recurring,
        daysBeforeAlert: h.daysBeforeAlert,
        notes: h.notes ?? null,
      }
    }),
  })

  return toCreate.length
}
