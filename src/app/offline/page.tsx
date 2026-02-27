'use client'

import { LuWifiOff } from 'react-icons/lu'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
      <LuWifiOff size={56} className="text-gray-300 dark:text-gray-600 mb-4" />
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Sem conexão
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Você está offline. Verifique sua conexão e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all touch-manipulation"
      >
        Tentar novamente
      </button>
    </main>
  )
}
