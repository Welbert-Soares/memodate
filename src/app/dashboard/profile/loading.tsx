function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    />
  )
}

export default function ProfileLoading() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex items-center justify-center"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <SkeletonLine className="h-5 w-20" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 py-4">
            <SkeletonLine className="h-20 w-20 rounded-full" />
            <SkeletonLine className="h-5 w-36" />
            <SkeletonLine className="h-4 w-44" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4 flex flex-col gap-3"
            >
              <SkeletonLine className="h-3 w-28" />
              <SkeletonLine className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
