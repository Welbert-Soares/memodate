'use client'

import { useState } from 'react'
import { LuCalendarCheck, LuCheck, LuLoader } from 'react-icons/lu'
import { importHolidays } from '@/lib/actions/holidays'

export function ImportHolidaysButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'upToDate'>(
    'idle',
  )

  async function handleImport() {
    setState('loading')
    const { created } = await importHolidays()
    setState(created > 0 ? 'done' : 'upToDate')
    setTimeout(() => setState('idle'), 4000)
  }

  const isLoading = state === 'loading'

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Feriados brasileiros
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {state === 'done' && 'Feriados importados com sucesso!'}
          {state === 'upToDate' && 'Todos os feriados já estão cadastrados.'}
          {(state === 'idle' || state === 'loading') &&
            'Importar Carnaval, Páscoa, Natal e outros.'}
        </p>
      </div>
      <button
        onClick={handleImport}
        disabled={isLoading || state === 'done' || state === 'upToDate'}
        className="flex items-center gap-1.5 shrink-0 ml-4 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors bg-indigo-600 text-white disabled:opacity-60 active:bg-indigo-700"
      >
        {state === 'loading' && (
          <LuLoader size={14} className="animate-spin" />
        )}
        {state === 'done' && <LuCheck size={14} />}
        {(state === 'idle' || state === 'upToDate') && (
          <LuCalendarCheck size={14} />
        )}
        {state === 'loading' ? 'Importando...' : 'Importar'}
      </button>
    </div>
  )
}
