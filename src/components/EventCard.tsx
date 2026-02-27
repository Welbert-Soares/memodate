'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LuTrash2, LuPencil } from 'react-icons/lu'
import { deleteEventById } from '@/lib/actions/events'
import { EventType } from '@/generated/prisma'
import { EventDetailModal } from '@/components/EventDetailModal'
import { haptic } from '@/lib/haptic'

type EventCardProps = {
  id: string
  title: string
  formattedDate: string
  type: EventType
  recurring: boolean
  daysBeforeAlert: number
  days: number
  typeLabel: string
  typeColor: string
  notes: string | null
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
  type,
  recurring,
  daysBeforeAlert,
  days,
  typeLabel,
  typeColor,
  notes,
}: EventCardProps) {
  const router = useRouter()

  const REVEAL = 80
  const THRESHOLD = 44

  const [swipeOffset, setSwipeOffset] = useState(0)
  const baseOffsetRef = useRef(0)
  const startXRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false)

  // Delete sheet
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [deleteSheetDragY, setDeleteSheetDragY] = useState(0)
  const deleteSheetDragRef = useRef<{ startY: number; lastY: number; lastTime: number } | null>(null)
  const [isDeleteSheetDragging, setIsDeleteSheetDragging] = useState(false)

  // Undo delete
  const [isDeleting, setIsDeleting] = useState(false)
  const [, startTransition] = useTransition()
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function snapTo(val: number) {
    if (val !== 0 && val !== baseOffsetRef.current) haptic(10)
    baseOffsetRef.current = val
    setSwipeOffset(val)
  }

  function openDeleteSheet() {
    snapTo(0)
    setDeleteSheetDragY(0)
    setDeleteOpen(true)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setDeleteVisible(true)),
    )
  }

  function closeDeleteSheet() {
    setDeleteVisible(false)
    setTimeout(() => { setDeleteOpen(false); setDeleteSheetDragY(0) }, 300)
  }

  function handleDeleteRequest() {
    setDetailOpen(false)
    setTimeout(() => openDeleteSheet(), 320)
  }

  function handleConfirmDelete() {
    haptic([10, 50, 15])
    closeDeleteSheet()
    setIsDeleting(true)
    deleteTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        await deleteEventById(id)
      })
    }, 4000)
  }

  function handleUndo() {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setIsDeleting(false)
  }

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    isDraggingRef.current = true
    setIsDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDraggingRef.current || startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    const raw = baseOffsetRef.current + dx
    const clamped = Math.max(-REVEAL, Math.min(REVEAL, raw))
    setSwipeOffset(clamped)
  }

  function onTouchEnd(e: React.TouchEvent) {
    isDraggingRef.current = false
    setIsDragging(false)
    if (startXRef.current === null) return

    const dx = e.changedTouches[0].clientX - startXRef.current
    startXRef.current = null

    // Tap while open → close
    if (Math.abs(dx) < 6 && baseOffsetRef.current !== 0) {
      snapTo(0)
      return
    }

    // Tap on closed card → open detail modal
    if (Math.abs(dx) < 6 && baseOffsetRef.current === 0) {
      haptic(8)
      setDetailOpen(true)
      return
    }

    if (swipeOffset <= -THRESHOLD) {
      snapTo(-REVEAL)
    } else if (swipeOffset >= THRESHOLD) {
      snapTo(REVEAL)
    } else {
      snapTo(0)
    }
  }

  // Delete sheet drag-to-dismiss handlers
  function onDeleteSheetTouchStart(e: React.TouchEvent) {
    deleteSheetDragRef.current = {
      startY: e.touches[0].clientY,
      lastY: e.touches[0].clientY,
      lastTime: Date.now(),
    }
    setIsDeleteSheetDragging(true)
  }

  function onDeleteSheetTouchMove(e: React.TouchEvent) {
    if (!deleteSheetDragRef.current) return
    const dy = e.touches[0].clientY - deleteSheetDragRef.current.startY
    deleteSheetDragRef.current.lastY = e.touches[0].clientY
    deleteSheetDragRef.current.lastTime = Date.now()
    setDeleteSheetDragY(Math.max(0, dy))
  }

  function onDeleteSheetTouchEnd(e: React.TouchEvent) {
    if (!deleteSheetDragRef.current) return
    const dy = e.changedTouches[0].clientY - deleteSheetDragRef.current.startY
    const elapsed = Date.now() - deleteSheetDragRef.current.lastTime
    const velocity = elapsed < 80 ? Math.abs(dy) / Math.max(elapsed, 1) : 0
    deleteSheetDragRef.current = null
    setIsDeleteSheetDragging(false)
    if (dy > 120 || velocity > 1) {
      closeDeleteSheet()
    } else {
      setDeleteSheetDragY(0)
    }
  }

  if (isDeleting) {
    return (
      <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>{' '}
          será excluído…
        </p>
        <button
          onClick={handleUndo}
          className="shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 active:opacity-60 transition-all touch-manipulation"
        >
          Desfazer
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Left action: Edit */}
        <button
          onClick={() => router.push(`/dashboard/events/${id}/edit`)}
          className="absolute left-0 top-0 bottom-0 w-[80px] flex items-center justify-center bg-white dark:bg-gray-800 active:opacity-60 touch-manipulation"
        >
          <LuPencil size={24} className="text-yellow-500" />
        </button>

        {/* Right action: Delete */}
        <button
          onClick={openDeleteSheet}
          className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center bg-white dark:bg-gray-800 active:opacity-60 touch-manipulation"
        >
          <LuTrash2 size={24} className="text-red-500" />
        </button>

        {/* Content — slides over the icons */}
        <div
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700 transition-colors px-4 py-4 relative cursor-pointer"
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
        </div>
      </div>

      <EventDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDeleteRequest={handleDeleteRequest}
        id={id}
        title={title}
        formattedDate={formattedDate}
        type={type}
        recurring={recurring}
        daysBeforeAlert={daysBeforeAlert}
        notes={notes}
      />

      {deleteOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
            style={{ opacity: deleteVisible ? Math.max(0, 0.4 - deleteSheetDragY / 400) : 0 }}
            onClick={closeDeleteSheet}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              transform: `translateY(${isDeleteSheetDragging || deleteSheetDragY > 0 ? deleteSheetDragY : deleteVisible ? 0 : 9999}px)`,
              transition: isDeleteSheetDragging ? 'none' : 'transform 300ms ease-out',
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 pt-6 shadow-2xl"
              style={{
                paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
              }}
              onTouchStart={onDeleteSheetTouchStart}
              onTouchMove={onDeleteSheetTouchMove}
              onTouchEnd={onDeleteSheetTouchEnd}
            >
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LuTrash2
                    size={24}
                    className="text-red-500 dark:text-red-400"
                  />
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
                  className="w-full rounded-xl bg-red-500 px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.97] transition-all touch-manipulation"
                >
                  Sim, excluir
                </button>
                <button
                  onClick={closeDeleteSheet}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.97] transition-all touch-manipulation"
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
