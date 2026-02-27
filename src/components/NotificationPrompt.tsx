'use client'

import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'memodate-notif-dismissed'

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

export function NotificationPrompt() {
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    async function check() {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return
      if (Notification.permission !== 'default') return
      if (localStorage.getItem(DISMISSED_KEY)) return

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      if (sub) return

      setShow(true)
      // Small delay so the slide-up animation is visible on mount
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }
    check()
  }, [])

  async function handleAllow() {
    dismiss()
    const registration = await navigator.serviceWorker.ready
    try {
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
    } catch {
      // User denied in browser dialog or another error — no action needed
    }
  }

  function handleLater() {
    localStorage.setItem(DISMISSED_KEY, '1')
    dismiss()
  }

  function dismiss() {
    setVisible(false)
    setTimeout(() => setShow(false), 300)
  }

  if (!show) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleLater}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />

          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white text-2xl">🔔</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Ativar lembretes?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receba notificações antes das datas importantes que você
                cadastrou.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAllow}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Ativar notificações
            </button>
            <button
              onClick={handleLater}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
