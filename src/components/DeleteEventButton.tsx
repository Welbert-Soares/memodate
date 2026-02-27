'use client'

import { useState, useTransition } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { deleteEvent } from '@/lib/actions/events'

export function DeleteEventButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openSheet() {
    setOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function closeSheet() {
    setVisible(false)
    setTimeout(() => setOpen(false), 300)
  }

  function handleConfirm() {
    startTransition(async () => {
      await deleteEvent(id)
    })
  }

  return (
    <>
      <button
        onClick={openSheet}
        className="rounded-lg border border-red-100 dark:border-red-900/40 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Excluir
      </button>

      {open && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeSheet}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl"
              style={{
                paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
              }}
            >
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LuTrash2 size={24} className="text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Excluir evento?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  &ldquo;{title}&rdquo; será removido permanentemente.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="w-full rounded-xl bg-red-500 px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {isPending ? 'Excluindo...' : 'Sim, excluir'}
                </button>
                <button
                  onClick={closeSheet}
                  disabled={isPending}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
