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
  { title: 'Dia Internacional da Mulher', month: 3, day: 8, recurring: true, daysBeforeAlert: 1 },
  { title: 'Tiradentes', month: 4, day: 21, recurring: true, daysBeforeAlert: 1 },
  { title: 'Dia do Trabalho', month: 5, day: 1, recurring: true, daysBeforeAlert: 1 },
  { title: 'Dia dos Namorados', month: 6, day: 12, recurring: true, daysBeforeAlert: 7 },
  { title: 'Festa Junina', month: 6, day: 24, recurring: true, daysBeforeAlert: 1 },
  { title: 'Independência do Brasil', month: 9, day: 7, recurring: true, daysBeforeAlert: 1 },
  { title: 'Nossa Senhora Aparecida', month: 10, day: 12, recurring: true, daysBeforeAlert: 1 },
  { title: 'Dia das Crianças', month: 10, day: 12, recurring: true, daysBeforeAlert: 7 },
  { title: 'Finados', month: 11, day: 2, recurring: true, daysBeforeAlert: 1 },
  { title: 'Proclamação da República', month: 11, day: 15, recurring: true, daysBeforeAlert: 1 },
  { title: 'Natal', month: 12, day: 25, recurring: true, daysBeforeAlert: 7 },
  { title: 'Réveillon', month: 12, day: 31, recurring: true, daysBeforeAlert: 1 },
]

// Cálculo de Páscoa (algoritmo Gregoriano anônimo)
function calcEaster(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

// Adiciona dias a uma data UTC e retorna { year, month, day }
function addUTCDays(
  year: number,
  month: number,
  day: number,
  delta: number,
): { year: number; month: number; day: number } {
  const d = new Date(Date.UTC(year, month - 1, day + delta))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

// N-esimo domingo de um mes
function nthSunday(year: number, month: number, n: number): number {
  let count = 0
  for (let d = 1; d <= 31; d++) {
    const date = new Date(Date.UTC(year, month - 1, d))
    if (date.getUTCMonth() !== month - 1) break
    if (date.getUTCDay() === 0) {
      count++
      if (count === n) return d
    }
  }
  return n * 7
}

// Gera datas moveis calculadas para o ano informado
function getMoveableHolidays(year: number): HolidayDef[] {
  const easter = calcEaster(year)
  const carnival = addUTCDays(year, easter.month, easter.day, -47)
  const goodFriday = addUTCDays(year, easter.month, easter.day, -2)
  const corpusChristi = addUTCDays(year, easter.month, easter.day, 60)
  const mothersDayDay = nthSunday(year, 5, 2)
  const fathersDayDay = nthSunday(year, 8, 2)

  return [
    { title: 'Carnaval', month: carnival.month, day: carnival.day, year: carnival.year, recurring: false, daysBeforeAlert: 7, notes: 'Data móvel — varia a cada ano.' },
    { title: 'Sexta-feira Santa', month: goodFriday.month, day: goodFriday.day, year: goodFriday.year, recurring: false, daysBeforeAlert: 1, notes: 'Data móvel — varia a cada ano.' },
    { title: 'Páscoa', month: easter.month, day: easter.day, year, recurring: false, daysBeforeAlert: 7, notes: 'Data móvel — varia a cada ano.' },
    { title: 'Dia das Mães', month: 5, day: mothersDayDay, year, recurring: false, daysBeforeAlert: 7, notes: '2º domingo de maio — varia a cada ano.' },
    { title: 'Corpus Christi', month: corpusChristi.month, day: corpusChristi.day, year: corpusChristi.year, recurring: false, daysBeforeAlert: 1, notes: 'Data móvel — varia a cada ano.' },
    { title: 'Dia dos Pais', month: 8, day: fathersDayDay, year, recurring: false, daysBeforeAlert: 7, notes: '2º domingo de agosto — varia a cada ano.' },
  ]
}

export async function seedHolidaysForUser(userId: string): Promise<number> {
  const existing = await prisma.event.findMany({
    where: { userId, type: EventType.HOLIDAY },
    select: { title: true },
  })

  const existingTitles = new Set(existing.map((e) => e.title))
  const currentYear = new Date().getFullYear()
  const allHolidays = [...FIXED_HOLIDAYS, ...getMoveableHolidays(currentYear)]
  const toCreate = allHolidays.filter((h) => !existingTitles.has(h.title))

  if (toCreate.length === 0) return 0

  await prisma.event.createMany({
    data: toCreate.map((h) => {
      const year = h.year ?? currentYear
      return {
        userId,
        title: h.title,
        date: new Date(
          `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}T12:00:00.000Z`,
        ),
        type: EventType.HOLIDAY,
        recurring: h.recurring,
        daysBeforeAlert: h.daysBeforeAlert,
        notes: h.notes ?? null,
      }
    }),
  })

  return toCreate.length
}
