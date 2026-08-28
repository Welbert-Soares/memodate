'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { EventType } from '@/generated/prisma'
import { haptic } from '@/lib/haptic'
import { EVENT_TYPE_CONFIG } from '@/lib/eventTypeConfig'

const DAYS_BEFORE_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'No dia' },
  { value: 1, label: '1 dia antes' },
  { value: 2, label: '2 dias antes' },
  { value: 3, label: '3 dias antes' },
  { value: 7, label: '1 semana antes' },
  { value: 14, label: '2 semanas antes' },
  { value: 30, label: '1 mês antes' },
]

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

const inputErrorClass =
  'rounded-xl border border-red-400 dark:border-red-500 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'

const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-300'

export function EventForm({ action, defaultValues }: EventFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const defaultDate = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().split('T')[0]
    : ''

  function handleSubmit(formData: FormData) {
    const title = ((formData.get('title') as string) ?? '').trim()
    const date = (formData.get('date') as string) ?? ''

    const newErrors: Record<string, string> = {}

    if (!title) newErrors.title = 'Informe o título do evento.'
    else if (title.length < 2) newErrors.title = 'Título deve ter ao menos 2 letras.'

    if (!date) newErrors.date = 'Informe a data do evento.'

    if (Object.keys(newErrors).length > 0) {
      haptic([30, 60, 30])
      setErrors(newErrors)
      return
    }

    haptic(10)
    setErrors({})
    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form
      action={handleSubmit}
      className={`flex flex-col gap-5 transition-opacity ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          disabled={isPending}
          defaultValue={defaultValues?.title}
          placeholder="Ex: Aniversário da mamãe"
          className={errors.title ? inputErrorClass : inputClass}
        />
        {errors.title && (
          <p className="text-xs text-red-500 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className={labelClass}>
          Data
        </label>
        <input
          id="date"
          name="date"
          type="date"
          disabled={isPending}
          defaultValue={defaultDate}
          className={errors.date ? inputErrorClass : inputClass}
        />
        {errors.date && (
          <p className="text-xs text-red-500 dark:text-red-400">{errors.date}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3">
        <div>
          <p className={labelClass}>Repetir todo ano</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Para aniversários e datas fixas
          </p>
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
        <p className={labelClass}>Tipo</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, (typeof EVENT_TYPE_CONFIG)[EventType]][]).map(
            ([value, config]) => {
              const Icon = config.icon
              return (
                <label
                  key={value}
                  className="relative flex items-center gap-2 rounded-xl border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 cursor-pointer transition-colors has-checked:border-indigo-500 has-checked:ring-1 has-checked:ring-indigo-500 has-checked:bg-indigo-50 dark:has-checked:bg-indigo-900/20"
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    disabled={isPending}
                    defaultChecked={(defaultValues?.type ?? 'OTHER') === value}
                    onChange={() => haptic(6)}
                    className="peer sr-only"
                  />
                  <span
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${config.dot}`}
                  >
                    <Icon size={16} className="text-white" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300">
                    {config.label}
                  </span>
                </label>
              )
            },
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>Lembrar quantos dias antes?</p>
        <div className="flex flex-wrap gap-2">
          {DAYS_BEFORE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="relative rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-colors has-checked:border-indigo-600 has-checked:bg-indigo-600 has-checked:text-white"
            >
              <input
                type="radio"
                name="daysBeforeAlert"
                value={opt.value}
                disabled={isPending}
                defaultChecked={(defaultValues?.daysBeforeAlert ?? 1) === opt.value}
                onChange={() => haptic(6)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={labelClass}>
          Notas{' '}
          <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
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
          className="flex-1 rounded-xl border border-gray-400 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.97] transition-all touch-manipulation"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
