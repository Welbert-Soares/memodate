function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4 flex items-start gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SkeletonLine className="h-4 w-2/5" />
          <SkeletonLine className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonLine className="h-3 w-1/3" />
        <SkeletonLine className="h-3 w-1/4" />
      </div>
      <div className="flex gap-2 shrink-0">
        <SkeletonLine className="h-7 w-14 rounded-lg" />
        <SkeletonLine className="h-7 w-14 rounded-lg" />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <SkeletonLine className="h-6 w-36" />
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-4 w-48 mt-0.5" />
          </div>
          <SkeletonLine className="h-9 w-20 rounded-xl" />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  )
}
