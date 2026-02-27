'use client'

import { useEffect, useRef, useState } from 'react'
import { LuDownload } from 'react-icons/lu'

const DISMISSED_KEY = 'memodate-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    // iPads in desktop mode
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

// iOS Share icon SVG (box + upward arrow)
function IOSShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

export function InstallPrompt() {
  const [mode, setMode] = useState<'android' | 'ios' | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)

  // Drag-to-dismiss
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startY: number; lastY: number; lastTime: number } | null>(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    if (isStandalone()) return

    if (isIOS()) {
      // Small delay so it doesn't pop up immediately on load
      setTimeout(() => {
        setMode('ios')
        setShow(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      }, 2000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setMode('android')
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
    setTimeout(() => { setShow(false); setDragY(0) }, 300)
  }

  function onSheetTouchStart(e: React.TouchEvent) {
    dragRef.current = {
      startY: e.touches[0].clientY,
      lastY: e.touches[0].clientY,
      lastTime: Date.now(),
    }
    setIsDragging(true)
  }

  function onSheetTouchMove(e: React.TouchEvent) {
    if (!dragRef.current) return
    const dy = e.touches[0].clientY - dragRef.current.startY
    dragRef.current.lastY = e.touches[0].clientY
    dragRef.current.lastTime = Date.now()
    setDragY(Math.max(0, dy))
  }

  function onSheetTouchEnd(e: React.TouchEvent) {
    if (!dragRef.current) return
    const dy = e.changedTouches[0].clientY - dragRef.current.startY
    const elapsed = Date.now() - dragRef.current.lastTime
    const velocity = elapsed < 80 ? Math.abs(dy) / Math.max(elapsed, 1) : 0
    dragRef.current = null
    setIsDragging(false)
    if (dy > 120 || velocity > 1) {
      handleLater()
    } else {
      setDragY(0)
    }
  }

  if (!show) return null

  const backdropOpacity = visible ? Math.max(0, 0.4 - dragY / 400) : 0

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{ opacity: backdropOpacity }}
        onClick={handleLater}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          transform: `translateY(${isDragging || dragY > 0 ? dragY : visible ? 0 : 9999}px)`,
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
        }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 shadow-2xl"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
          onTouchStart={onSheetTouchStart}
          onTouchMove={onSheetTouchMove}
          onTouchEnd={onSheetTouchEnd}
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
                Adicione à tela inicial para acesso rápido, sem abrir o navegador.
              </p>
            </div>
          </div>

          {mode === 'ios' ? (
            <>
              {/* iOS step-by-step instructions */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                    <IOSShareIcon />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Toque no botão <span className="font-semibold">Compartilhar</span> na barra do Safari
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Role e toque em <span className="font-semibold">&ldquo;Adicionar à Tela de Início&rdquo;</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleLater}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97] transition-all touch-manipulation"
              >
                Entendi
              </button>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </>
  )
}
