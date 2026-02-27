'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type Status =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed'

export function PushSubscribeButton() {
  const [status, setStatus] = useState<Status>('loading')

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
  }

  async function handleUnsubscribe() {
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
  }

  if (status === 'loading') return null

  if (status === 'unsupported') {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Adicione à tela inicial para ativar notificações.
      </p>
    )
  }

  if (status === 'denied') {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Notificações bloqueadas no navegador.
      </p>
    )
  }

  return (
    <button
      onClick={status === 'subscribed' ? handleUnsubscribe : handleSubscribe}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
        status === 'subscribed'
          ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          : 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
      }`}
    >
      {status === 'subscribed'
        ? '🔔 Notificações ativas'
        : '🔕 Ativar notificações'}
    </button>
  )
}
