'use client'

import { useState, useTransition } from 'react'
import { LuMessageCircle, LuTrash2, LuCheck, LuLoader, LuExternalLink } from 'react-icons/lu'
import { updateWhatsappSettings, removeWhatsappSettings } from '@/lib/actions/settings'

type Props = {
  initialPhone: string | null
  initialApiKey: string | null
}

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 13)
  if (d.length <= 2) return d.length ? `+${d}` : ''
  if (d.length <= 4) return `+${d.slice(0, 2)} (${d.slice(2)})`
  if (d.length <= 9) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4)}`
  const local = d.slice(4)
  const split = local.length === 9 ? 5 : 4
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${local.slice(0, split)}-${local.slice(split)}`
}

function onlyDigits(masked: string): string {
  return masked.replace(/\D/g, '')
}

const CALLMEBOT_LINK =
  'https://wa.me/34684770005?text=I%20allow%20callmebot%20to%20send%20me%20messages'

export function WhatsappSettings({ initialPhone, initialApiKey }: Props) {
  const [phone, setPhone] = useState(initialPhone ? maskPhone(initialPhone) : '')
  const [apiKey, setApiKey] = useState(initialApiKey ?? '')
  const [saved, setSaved] = useState(!!initialPhone)
  const [savedPhone, setSavedPhone] = useState(initialPhone ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(maskPhone(e.target.value))
  }

  function handleSave() {
    setError('')
    const digits = onlyDigits(phone)
    startTransition(async () => {
      const result = await updateWhatsappSettings(digits, apiKey)
      if (result.ok) {
        setSavedPhone(digits)
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
      setSavedPhone('')
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
              {maskPhone(savedPhone)} configurado
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
          <a
            href={CALLMEBOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:opacity-70 transition-all touch-manipulation"
          >
            <span>1. Ativar CallMeBot no WhatsApp</span>
            <LuExternalLink size={15} className="shrink-0 text-gray-400" />
          </a>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              2. Seu número
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+55 (31) 9565-0333"
              disabled={isPending}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Use o número como está no WhatsApp — sem o 9 extra (ex: 553195650333).
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              3. API Key recebida do bot
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value.trim())}
              placeholder="1234567"
              disabled={isPending}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || onlyDigits(phone).length < 10 || !apiKey}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 active:scale-[0.97] transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <LuLoader size={16} className="animate-spin" />}
            Salvar
          </button>
        </div>
      )}
    </div>
  )
}
