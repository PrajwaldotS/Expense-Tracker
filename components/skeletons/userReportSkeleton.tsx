export default function AdminDashboardShimmer() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* TOTAL EXPENSE CARD SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-6 w-56 bg-muted rounded" />
        </div>
      </div>

      {/* BAR CHART SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl p-6">
        <div className="space-y-2 mb-4">
          <div className="h-5 w-64 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>

        {/* Fake bars */}
        <div className="flex items-end gap-4 h-72">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-muted rounded-t"
              style={{ height: `${30 + i * 8}%` }}
            />
          ))}
        </div>
      </div>

      {/* SEARCH SHIMMER */}
      <div className="max-w-sm">
        <div className="h-10 bg-muted rounded-lg" />
      </div>

      {/* USER TOTALS TABLE SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">

          {/* Table Head */}
          <div className="grid grid-cols-4 gap-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-4 gap-4 items-center py-3"
            >
              <div className="h-4 bg-muted rounded w-10" />
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION SHIMMER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="h-9 w-20 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-9 w-20 bg-muted rounded" />
        </div>

        <div className="h-9 w-28 bg-muted rounded" />
      </div>

    </div>
  )
}
