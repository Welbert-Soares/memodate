import { BottomNav } from '@/components/BottomNav'
import { PageTransition } from '@/components/PageTransition'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <ErrorBoundary>
        <PageTransition>{children}</PageTransition>
      </ErrorBoundary>
      <BottomNav />
    </div>
  )
}
