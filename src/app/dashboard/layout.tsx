import { BottomNav } from '@/components/BottomNav'
import { PageTransition } from '@/components/PageTransition'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NetworkStatus } from '@/components/NetworkStatus'
import { ServiceWorkerUpdater } from '@/components/ServiceWorkerUpdater'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <NetworkStatus />
      <ErrorBoundary>
        <PageTransition>{children}</PageTransition>
      </ErrorBoundary>
      <BottomNav />
      <ServiceWorkerUpdater />
    </div>
  )
}
