import Link from 'next/link'
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

export function EventForm({ action, defaultValues }: EventFormProps) {
  const defaultDate = defaultValues?.date
    ? new Date(defaultValues.date).toISOString().split('T')[0]
    : ''

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          placeholder="Ex: Aniversário da mamãe"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Data */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="text-sm font-medium text-gray-700">
          Data
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultDate}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-sm font-medium text-gray-700">
          Tipo
        </label>
        <select
          id="type"
          name="type"
          defaultValue={defaultValues?.type ?? 'OTHER'}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        >
          {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Recorrência anual */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Repetir todo ano</p>
          <p className="text-xs text-gray-400">
            Para aniversários e datas fixas
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="recurring"
            value="true"
            defaultChecked={defaultValues?.recurring ?? true}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Dias antes */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="daysBeforeAlert"
          className="text-sm font-medium text-gray-700"
        >
          Lembrar quantos dias antes?
        </label>
        <select
          id="daysBeforeAlert"
          name="daysBeforeAlert"
          defaultValue={defaultValues?.daysBeforeAlert ?? 1}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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

      {/* Notas */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Notas <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ''}
          placeholder="Ex: Ligar às 8h, comprar presente..."
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
