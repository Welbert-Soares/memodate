'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const MESSAGES: Record<string, { text: string; icon: string }> = {
  saved: { text: 'Evento salvo!', icon: '✓' },
  deleted: { text: 'Evento excluído.', icon: '✓' },
}

export function Toast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState<{ text: string; icon: string } | null>(
    null,
  )

  useEffect(() => {
    const toast = searchParams.get('toast')
    if (!toast || !MESSAGES[toast]) return

    setMessage(MESSAGES[toast])
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))

    const hideTimer = setTimeout(() => setVisible(false), 2700)
    const removeTimer = setTimeout(() => {
      setMessage(null)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('toast')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }, 3000)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [searchParams, pathname, router])

  if (!message) return null

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-medium">
        <span className="text-green-400 dark:text-green-600 font-bold">
          {message.icon}
        </span>
        {message.text}
      </div>
    </div>
  )
}
