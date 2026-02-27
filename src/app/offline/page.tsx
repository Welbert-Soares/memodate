'use client'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Sem conexão
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Você está offline. Verifique sua conexão e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Tentar novamente
      </button>
    </main>
  )
}
