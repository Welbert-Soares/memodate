import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Seus eventos aparecerão aqui.
        </p>
      </div>
    </main>
  )
}
