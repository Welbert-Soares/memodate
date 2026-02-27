'use client'

import { useEffect, useState } from 'react'
import { LuDownload } from 'react-icons/lu'

const DISMISSED_KEY = 'memodate-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    dismiss()
    await deferredPrompt.prompt()
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
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleLater}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 shadow-2xl"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <LuDownload size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Instalar Memodate
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Adicione à tela inicial para acesso rápido, sem precisar abrir o
                navegador.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleInstall}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white active:scale-[0.97] transition-all touch-manipulation"
            >
              Instalar app
            </button>
            <button
              onClick={handleLater}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.97] transition-all touch-manipulation"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
