function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    />
  )
}

export default function NewEventLoading() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
      <div
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex items-center gap-3"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <SkeletonLine className="h-8 w-8 rounded-xl" />
        <SkeletonLine className="h-5 w-32" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-6 flex flex-col gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <SkeletonLine className="h-3 w-20" />
                <SkeletonLine className="h-11 w-full rounded-xl" />
              </div>
            ))}
            <SkeletonLine className="h-12 w-full rounded-xl mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
