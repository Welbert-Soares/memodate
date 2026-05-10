'use client'

import { useState, useTransition } from 'react'
import { LuMessageCircle, LuTrash2, LuCheck, LuLoader } from 'react-icons/lu'
import { updateWhatsappSettings, removeWhatsappSettings } from '@/lib/actions/settings'

type Props = {
  initialPhone: string | null
  initialApiKey: string | null
}

export function WhatsappSettings({ initialPhone, initialApiKey }: Props) {
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [apiKey, setApiKey] = useState(initialApiKey ?? '')
  const [saved, setSaved] = useState(!!initialPhone)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await updateWhatsappSettings(phone, apiKey)
      if (result.ok) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Erro ao salvar')
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeWhatsappSettings()
      setPhone('')
      setApiKey('')
      setSaved(false)
    })
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
          <LuMessageCircle size={18} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Resumo mensal por WhatsApp
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            No dia 1 de cada mês você recebe uma mensagem com todos os eventos do mês.
          </p>
        </div>
      </div>

      {saved ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <LuCheck size={16} className="text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              +{initialPhone ?? phone} configurado
            </p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 transition-colors touch-manipulation disabled:opacity-50"
          >
            <LuTrash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Número (com DDI, ex: 5511999999999)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999999999"
              disabled={isPending}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              API Key do CallMeBot
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="123456"
              disabled={isPending}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Envie{' '}
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                I allow callmebot.com to send me messages
              </span>{' '}
              para +34 644 33 31 88 no WhatsApp para obter sua chave.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || !phone || !apiKey}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 active:scale-[0.97] transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <LuLoader size={16} className="animate-spin" />
            ) : null}
            Salvar
          </button>
        </div>
      )}
    </div>
  )
}
