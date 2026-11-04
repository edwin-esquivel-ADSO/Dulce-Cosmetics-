export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200/80 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-gray-200/60 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200/70 rounded-xl" />
          <div className="h-10 w-36 bg-gray-200/70 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200/70 rounded" />
              <div className="w-8 h-8 rounded-lg bg-gray-200/60" />
            </div>
            <div className="h-7 w-28 bg-gray-200 rounded-lg" />
            <div className="h-3 w-36 bg-gray-200/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="h-5 w-48 bg-gray-200/70 rounded" />
          <div className="h-9 w-64 bg-gray-100 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200/70" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-gray-200/80 rounded" />
                  <div className="h-3 w-24 bg-gray-200/50 rounded" />
                </div>
              </div>
              <div className="hidden sm:block h-4 w-32 bg-gray-200/60 rounded" />
              <div className="h-6 w-20 bg-gray-200/60 rounded-full" />
              <div className="h-8 w-20 bg-gray-200/70 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
