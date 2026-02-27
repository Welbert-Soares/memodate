import { signIn } from '@/auth'
import { LoginButton } from '@/components/LoginButton'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-indigo-100 dark:bg-indigo-900/20 blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center gap-6">

        {/* Logo + title */}
        <div
          className="flex flex-col items-center gap-2"
          style={{ animation: 'pageEnter 0.4s ease-out both' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icone_memodate.webp"
              alt="Memodate"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            Memodate
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Lembretes de datas importantes
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px bg-gray-100 dark:bg-gray-700"
          style={{ animation: 'pageEnter 0.4s ease-out 0.08s both' }}
        />

        {/* Sign-in form */}
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/dashboard' })
          }}
          className="w-full"
          style={{ animation: 'pageEnter 0.4s ease-out 0.12s both' }}
        >
          <LoginButton />
        </form>

        {/* Footer */}
        <p
          className="text-xs text-gray-400 dark:text-gray-500 text-center"
          style={{ animation: 'pageEnter 0.4s ease-out 0.18s both' }}
        >
          Ao entrar, você concorda com o uso do app para lembretes pessoais.
        </p>
      </div>
    </main>
  )
}
