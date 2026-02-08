export default function ZoneSummaryShimmer() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* PIE CHART SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl p-6">
        <div className="space-y-2 mb-4">
          <div className="h-5 w-64 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>

        {/* Circle placeholder */}
        <div className="flex justify-center items-center h-80">
          <div className="w-56 h-56 rounded-full bg-muted" />
        </div>
      </div>

      {/* SEARCH SHIMMER */}
      <div className="max-w-sm">
        <div className="h-10 bg-muted rounded-lg" />
      </div>

      {/* TABLE SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">

          {/* Table Head */}
          <div className="grid grid-cols-5 gap-4 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-5 gap-4 items-center py-3"
            >
              {/* Zone */}
              <div className="h-6 bg-muted rounded w-24" />

              {/* Created At */}
              <div className="h-4 bg-muted rounded w-24" />

              {/* Created By */}
              <div className="h-4 bg-muted rounded w-32" />

              {/* Total Expenses */}
              <div className="h-4 bg-muted rounded w-28" />

              {/* Expense Count */}
              <div className="h-6 bg-muted rounded w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION SHIMMER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded self-center" />
          <div className="h-9 w-20 bg-muted rounded" />
        </div>

        <div className="h-9 w-28 bg-muted rounded" />
      </div>

    </div>
  )
}
