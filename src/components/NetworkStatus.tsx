'use client'

import { useState, useEffect } from 'react'
import { LuWifiOff, LuWifi } from 'react-icons/lu'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBack, setShowBack] = useState(false)
  const showBackRef = { current: false }

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOnline() {
      setIsOnline(true)
      if (showBackRef.current) return
      showBackRef.current = true
      setShowBack(true)
      setTimeout(() => {
        setShowBack(false)
        showBackRef.current = false
      }, 2500)
    }

    function handleOffline() {
      setIsOnline(false)
      setShowBack(false)
      showBackRef.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isOnline && !showBack) return null

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 dark:bg-gray-950 text-white'
      }`}
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      {isOnline ? (
        <>
          <LuWifi size={14} />
          Conexão restaurada
        </>
      ) : (
        <>
          <LuWifiOff size={14} />
          Sem conexão com a internet
        </>
      )}
    </div>
  )
}
