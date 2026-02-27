'use client'

import { useState, useEffect } from 'react'
import { EventType } from '@/generated/prisma'
import { EventCard } from '@/components/EventCard'
import {
  LuList,
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu'
import Link from 'next/link'

export type ProcessedEvent = {
  id: string
  title: string
  dateMs: number // Date.getTime() — serializable across RSC boundary
  type: EventType
  recurring: boolean
  daysBeforeAlert: number
  days: number
  formattedDate: string
  typeLabel: string
  typeColor: string
  typeDot: string // Tailwind bg- class for calendar dot
  notes: string | null
}

const TYPE_FILTERS: { value: EventType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'BIRTHDAY', label: 'Aniversário' },
  { value: 'ANNIVERSARY', label: 'Comemoração' },
  { value: 'HOLIDAY', label: 'Data especial' },
  { value: 'OTHER', label: 'Outro' },
]

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const PT_MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Returns the event date for a given year/month (recurring uses any year
// with matching month; non-recurring must match year+month).
function getEventDayInMonth(
  event: { dateMs: number; recurring: boolean },
  year: number,
  month: number,
): number | null {
  const d = new Date(event.dateMs)
  if (event.recurring) {
    return d.getUTCMonth() === month ? d.getUTCDate() : null
  }
  if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
    return d.getUTCDate()
  }
  return null
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function DashboardContent({ events }: { events: ProcessedEvent[] }) {
  const [filter, setFilter] = useState<EventType | 'ALL'>('ALL')
  const [view, setView] = useState<'list' | 'calendar'>('calendar')

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())

  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth()
  const todayDay = now.getDate()

  // App badge: show count of events in next 30 days
  useEffect(() => {
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>
      clearAppBadge?: () => Promise<void>
    }
    if (!nav.setAppBadge) return
    const count = events.filter((e) => e.days >= 0 && e.days <= 30).length
    if (count > 0) {
      nav.setAppBadge(count)
    } else {
      nav.clearAppBadge?.()
    }
  }, [events])

  const filtered =
    filter === 'ALL' ? events : events.filter((e) => e.type === filter)

  // Present types that actually appear in events (for filter chips)
  const presentTypes = Array.from(new Set(events.map((e) => e.type)))

  // Calendar: map day → events
  const calendarCells = buildCalendarDays(calYear, calMonth)
  const eventsByDay = new Map<number, ProcessedEvent[]>()
  for (const event of events) {
    const day = getEventDayInMonth(event, calYear, calMonth)
    if (day !== null) {
      if (!eventsByDay.has(day)) eventsByDay.set(day, [])
      eventsByDay.get(day)!.push(event)
    }
  }

  const dayEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : []

  function prevMonth() {
    setSelectedDay(null)
    if (calMonth === 0) {
      setCalYear((y) => y - 1)
      setCalMonth(11)
    } else setCalMonth((m) => m - 1)
  }
  function nextMonth() {
    setSelectedDay(null)
    if (calMonth === 11) {
      setCalYear((y) => y + 1)
      setCalMonth(0)
    } else setCalMonth((m) => m + 1)
  }

  return (
    <>
      {/* Toolbar: view toggle + filter chips */}
      <div className="flex items-center gap-2 mb-4">
        {/* View toggle */}
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm transition-all active:scale-95 touch-manipulation ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LuList size={16} />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm transition-all active:scale-95 touch-manipulation ${view === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LuCalendarDays size={16} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto flex-1 scrollbar-hide">
          <button
            onClick={() => setFilter('ALL')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 touch-manipulation ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Todos
          </button>
          {TYPE_FILTERS.slice(1)
            .filter((f) => presentTypes.includes(f.value as EventType))
            .map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 touch-manipulation ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {f.label}
              </button>
            ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="flex flex-col gap-3 mt-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
              Nenhum evento nessa categoria.
            </p>
          ) : (
            filtered.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                formattedDate={event.formattedDate}
                type={event.type}
                recurring={event.recurring}
                daysBeforeAlert={event.daysBeforeAlert}
                days={event.days}
                typeLabel={event.typeLabel}
                typeColor={event.typeColor}
                notes={event.notes}
              />
            ))
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 pt-4 pb-3">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90 transition-all touch-manipulation"
              >
                <LuChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {PT_MONTHS[calMonth]} {calYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90 transition-all touch-manipulation"
              >
                <LuChevronRight size={18} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
              {calendarCells.map((day, i) => {
                if (day === null) return <div key={i} />

                const isToday =
                  calYear === todayYear &&
                  calMonth === todayMonth &&
                  day === todayDay
                const isSelected = day === selectedDay
                const dayEvs = eventsByDay.get(day) ?? []
                const hasEvents = dayEvs.length > 0

                return (
                  <button
                    key={i}
                    onClick={() =>
                      setSelectedDay(day === selectedDay ? null : day)
                    }
                    className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all active:scale-90 touch-manipulation ${
                      isSelected
                        ? 'bg-indigo-600'
                        : isToday
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : hasEvents
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`text-sm leading-none ${
                        isSelected
                          ? 'font-bold text-white'
                          : isToday
                            ? 'font-bold text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvs.slice(0, 3).map((ev, j) => (
                          <div
                            key={j}
                            className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : ev.typeDot}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day events */}
          {selectedDay !== null && (
            <div className="flex flex-col gap-2">
              {dayEvents.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                  Nenhum evento neste dia.
                </p>
              ) : (
                dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    formattedDate={event.formattedDate}
                    type={event.type}
                    recurring={event.recurring}
                    daysBeforeAlert={event.daysBeforeAlert}
                    days={event.days}
                    typeLabel={event.typeLabel}
                    typeColor={event.typeColor}
                    notes={event.notes}
                  />
                ))
              )}
            </div>
          )}

          {/* If no events exist in this month */}
          {selectedDay === null && eventsByDay.size === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              Nenhum evento em {PT_MONTHS[calMonth].toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {/* Empty state (list view, no events at all) */}
      {view === 'list' && events.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3 mt-2">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Adicione seu primeiro evento para começar a receber lembretes.
          </p>
          <Link
            href="/dashboard/events/new"
            className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Criar evento
          </Link>
        </div>
      )}
    </>
  )
}
