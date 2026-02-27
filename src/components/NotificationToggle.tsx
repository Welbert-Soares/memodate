'use client'

import { useState, useEffect } from 'react'
import { urlBase64ToUint8Array } from '@/lib/vapid'


type Status =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed'

export function NotificationToggle() {
  const [status, setStatus] = useState<Status>('loading')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    async function init() {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setStatus('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setStatus('denied')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setStatus(sub ? 'subscribed' : 'unsubscribed')
    }
    init()
  }, [])

  async function handleSubscribe() {
    setPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      })
      setStatus('subscribed')
    } catch {
      // Permission denied or error
    } finally {
      setPending(false)
    }
  }

  async function handleUnsubscribe() {
    setPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus('unsubscribed')
    } catch {
      // Error
    } finally {
      setPending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    )
  }

  if (status === 'unsupported') {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Notificações não suportadas neste dispositivo.
      </p>
    )
  }

  if (status === 'denied') {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Notificações bloqueadas. Altere nas configurações do navegador.
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {status === 'subscribed'
            ? 'Notificações ativas'
            : 'Notificações desativadas'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {status === 'subscribed'
            ? 'Você receberá lembretes antes das datas.'
            : 'Ative para receber lembretes antes das datas.'}
        </p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={status === 'subscribed'}
          disabled={pending}
          onChange={
            status === 'subscribed' ? handleUnsubscribe : handleSubscribe
          }
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-disabled:opacity-50" />
      </label>
    </div>
  )
}
