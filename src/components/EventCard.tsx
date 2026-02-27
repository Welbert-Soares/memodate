'use client'

import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { deleteEvent } from '@/lib/actions/events'

type EventCardProps = {
  id: string
  title: string
  formattedDate: string
  recurring: boolean
  daysBeforeAlert: number
  days: number
  typeLabel: string
  typeColor: string
}

function DaysLabel({ days }: { days: number }) {
  if (days < 0)
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">passou</span>
    )
  if (days === 0)
    return (
      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        hoje!
      </span>
    )
  if (days === 1)
    return (
      <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">
        amanhã
      </span>
    )
  if (days <= 7)
    return (
      <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">
        em {days} dias
      </span>
    )
  return (
    <span className="text-xs text-gray-400 dark:text-gray-500">
      em {days} dias
    </span>
  )
}

export function EventCard({
  id,
  title,
  formattedDate,
  recurring,
  daysBeforeAlert,
  days,
  typeLabel,
  typeColor,
}: EventCardProps) {
  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0)
  const startXRef = useRef<number | null>(null)
  const isDragging = useRef(false)
  const REVEAL = 72
  const THRESHOLD = 48

  // Delete sheet state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openDeleteSheet() {
    setSwipeOffset(0)
    setDeleteOpen(true)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setDeleteVisible(true)),
    )
  }

  function closeDeleteSheet() {
    setDeleteVisible(false)
    setTimeout(() => setDeleteOpen(false), 300)
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      await deleteEvent(id)
    })
  }

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    isDragging.current = true
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    if (dx > 0) {
      setSwipeOffset(0)
      return
    }
    setSwipeOffset(Math.max(dx, -REVEAL))
  }

  function onTouchEnd() {
    isDragging.current = false
    if (swipeOffset <= -THRESHOLD) {
      setSwipeOffset(-REVEAL)
    } else {
      setSwipeOffset(0)
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Swipe action background */}
        <div className="absolute right-0 top-0 bottom-0 w-[72px] flex items-center justify-center bg-red-500 rounded-2xl">
          <button
            onClick={openDeleteSheet}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-white"
          >
            <LuTrash2 size={20} />
            <span className="text-[10px] font-semibold">Excluir</span>
          </button>
        </div>

        {/* Card */}
        <div
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.2s ease',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4 flex items-start gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {title}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}
              >
                {typeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
                {recurring && ' · repete todo ano'}
              </p>
              <DaysLabel days={days} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Lembrete:{' '}
              {daysBeforeAlert === 0
                ? 'no dia'
                : `${daysBeforeAlert} dia${daysBeforeAlert > 1 ? 's' : ''} antes`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/dashboard/events/${id}/edit`}
              className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={openDeleteSheet}
              className="rounded-lg border border-red-100 dark:border-red-900/40 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation sheet */}
      {deleteOpen && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${deleteVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeDeleteSheet}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${deleteVisible ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 shadow-2xl"
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
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                  className="w-full rounded-xl bg-red-500 px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {isPending ? 'Excluindo...' : 'Sim, excluir'}
                </button>
                <button
                  onClick={closeDeleteSheet}
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
