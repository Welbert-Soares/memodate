'use client'

import { useState, useTransition } from 'react'
import { updateTimezone } from '@/lib/actions/events'

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza / Nordeste (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (UTC-4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (UTC-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-5)' },
  { value: 'America/New_York', label: 'Nova York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
  { value: 'Europe/Lisbon', label: 'Lisboa (UTC+0/+1)' },
  { value: 'UTC', label: 'UTC' },
]

export function TimezoneSelector({ current }: { current: string }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tz = e.target.value
    setSaved(false)
    startTransition(async () => {
      await updateTimezone(tz)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Fuso horário
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Usado para enviar lembretes no horário certo
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {saved && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 transition-opacity">
            ✓ Salvo
          </span>
        )}
        <select
          defaultValue={current}
          onChange={handleChange}
          disabled={isPending}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
