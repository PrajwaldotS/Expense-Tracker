export default function ZoneReportsShimmer() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* SEARCH SHIMMER */}
      <div className="max-w-md">
        <div className="h-10 bg-muted rounded-lg" />
      </div>

      {/* TABLE SHIMMER */}
      <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">

          {/* Table Head */}
          <div className="grid grid-cols-6 gap-4 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-4 items-center py-3"
            >
              {/* User */}
              <div className="h-4 bg-muted rounded w-28" />

              {/* Category */}
              <div className="h-6 bg-muted rounded w-24" />

              {/* Zone */}
              <div className="h-6 bg-muted rounded w-24" />

              {/* Amount */}
              <div className="h-4 bg-muted rounded w-20" />

              {/* Date */}
              <div className="h-4 bg-muted rounded w-24" />

              {/* Actions */}
              <div className="h-6 w-6 bg-muted rounded ml-auto" />
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
