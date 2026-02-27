'use client'

import { useEffect, useState } from 'react'

export function ServiceWorkerUpdater() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Capture the controller active when this page loaded.
    // If it changes later, a new SW has claimed control → prompt reload.
    const initialController = navigator.serviceWorker.controller

    function onControllerChange() {
      // Only show banner when there WAS already a controller
      // (i.e. this is an update, not the very first SW install).
      if (initialController) {
        setShowBanner(true)
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 inset-x-4 z-50 max-w-lg mx-auto">
      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Atualização disponível</p>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl active:opacity-80 touch-manipulation"
        >
          Recarregar
        </button>
      </div>
    </div>
  )
}
