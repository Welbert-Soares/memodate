'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EventType } from '@/generated/prisma'
import {
  LuCalendarDays,
  LuBell,
  LuRepeat2,
  LuStickyNote,
  LuPencil,
  LuTrash2,
  LuX,
} from 'react-icons/lu'
import { haptic } from '@/lib/haptic'
import { EVENT_TYPE_CONFIG } from '@/lib/eventTypeConfig'

function alertLabel(days: number): string {
  if (days === 0) return 'No dia do evento'
  if (days === 1) return '1 dia antes'
  if (days === 7) return '1 semana antes'
  if (days === 14) return '2 semanas antes'
  if (days === 30) return '1 mês antes'
  return `${days} dias antes`
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onDeleteRequest: () => void
  id: string
  title: string
  formattedDate: string
  type: EventType
  recurring: boolean
  daysBeforeAlert: number
  notes: string | null
}

export function EventDetailModal({
  isOpen,
  onClose,
  onDeleteRequest,
  id,
  title,
  formattedDate,
  type,
  recurring,
  daysBeforeAlert,
  notes,
}: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  // Drag-to-dismiss
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startY: number; lastY: number; lastTime: number } | null>(null)
  const passedThreshold = useRef(false)

  useEffect(() => {
    if (isOpen) {
      passedThreshold.current = false
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setTimeout(() => {
        setVisible(false)
        setDragY(0)
      }, 0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const typeConfig = EVENT_TYPE_CONFIG[type]
  const backdropOpacity = visible ? Math.max(0, 0.4 - dragY / 400) : 0

  function onSheetTouchStart(e: React.TouchEvent) {
    dragRef.current = {
      startY: e.touches[0].clientY,
      lastY: e.touches[0].clientY,
      lastTime: Date.now(),
    }
    passedThreshold.current = false
    setIsDragging(true)
  }

  function onSheetTouchMove(e: React.TouchEvent) {
    if (!dragRef.current) return
    const dy = e.touches[0].clientY - dragRef.current.startY
    dragRef.current.lastY = e.touches[0].clientY
    dragRef.current.lastTime = Date.now()
    const clamped = Math.max(0, dy)
    setDragY(clamped)
    if (clamped > 80 && !passedThreshold.current) {
      passedThreshold.current = true
      haptic(8)
    }
  }

  function onSheetTouchEnd(e: React.TouchEvent) {
    if (!dragRef.current) return
    const dy = e.changedTouches[0].clientY - dragRef.current.startY
    const elapsed = Date.now() - dragRef.current.lastTime
    const velocity = elapsed < 80 ? Math.abs(dy) / Math.max(elapsed, 1) : 0
    dragRef.current = null
    setIsDragging(false)
    if (dy > 120 || velocity > 1) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{ opacity: backdropOpacity }}
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          transform: `translateY(${isDragging || dragY > 0 ? dragY : visible ? 0 : 9999}px)`,
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
        }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          onTouchStart={onSheetTouchStart}
          onTouchMove={onSheetTouchMove}
          onTouchEnd={onSheetTouchEnd}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeConfig.color}`}
              >
                {typeConfig.label}
              </span>
              <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-90 transition-all touch-manipulation"
            >
              <LuX size={20} />
            </button>
          </div>

          {/* Details */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuCalendarDays
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Data</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuRepeat2
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Repetição
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {recurring ? 'Repete todo ano' : 'Não repete'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <LuBell
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Lembrete
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {alertLabel(daysBeforeAlert)}
                </p>
              </div>
            </div>

            {notes && (
              <div className="flex items-start gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <LuStickyNote
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Notas
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pt-4">
            <button
              onClick={() => {
                onClose()
                router.push(`/dashboard/events/${id}/edit`)
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.96] transition-all touch-manipulation"
            >
              <LuPencil size={16} className="text-yellow-500" />
              Editar
            </button>
            <button
              onClick={onDeleteRequest}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.96] transition-all touch-manipulation"
            >
              <LuTrash2 size={16} />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
