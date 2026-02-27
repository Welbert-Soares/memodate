import { BottomNav } from '@/components/BottomNav'
import { PageTransition } from '@/components/PageTransition'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </div>
  )
}
