'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { EventType } from '@/generated/prisma'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  BIRTHDAY: 'Aniversário',
  ANNIVERSARY: 'Comemoração',
  HOLIDAY: 'Feriado / Data especial',
  OTHER: 'Outro',
}

type EventFormProps = {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    title?: string
    date?: Date
    type?: EventType
    recurring?: boolean
    daysBeforeAlert?: number
    notes?: string | null
  }
}

const inputClass =
  'rounded-xl border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300'

export function EventForm({ action, defaultValues }: EventFormProps) {
  const [isPending, startTransition] = useTransition()

  const defaultDate = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().split('T')[0]
    : ''

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form action={handleSubmit} className={`flex flex-col gap-5 transition-opacity ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>Título</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          disabled={isPending}
          defaultValue={defaultValues?.title}
          placeholder="Ex: Aniversário da mamãe"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className={labelClass}>Data</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          disabled={isPending}
          defaultValue={defaultDate}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className={labelClass}>Tipo</label>
        <select
          id="type"
          name="type"
          disabled={isPending}
          defaultValue={defaultValues?.type ?? 'OTHER'}
          className={inputClass}
        >
          {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3">
        <div>
          <p className={labelClass}>Repetir todo ano</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Para aniversários e datas fixas</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="recurring"
            value="true"
            disabled={isPending}
            defaultChecked={defaultValues?.recurring ?? true}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="daysBeforeAlert" className={labelClass}>
          Lembrar quantos dias antes?
        </label>
        <select
          id="daysBeforeAlert"
          name="daysBeforeAlert"
          disabled={isPending}
          defaultValue={defaultValues?.daysBeforeAlert ?? 1}
          className={inputClass}
        >
          <option value="0">No dia</option>
          <option value="1">1 dia antes</option>
          <option value="2">2 dias antes</option>
          <option value="3">3 dias antes</option>
          <option value="7">1 semana antes</option>
          <option value="14">2 semanas antes</option>
          <option value="30">1 mês antes</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={labelClass}>
          Notas <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={isPending}
          defaultValue={defaultValues?.notes ?? ''}
          placeholder="Ex: Ligar às 8h, comprar presente..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-gray-400 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
