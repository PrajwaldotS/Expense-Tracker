export default function CategoryTableShimmer() {
  return (
    <div className="bg-card border shadow-sm rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 space-y-4">

        {/* Header */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>

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
            {/* Name */}
            <div className="h-4 bg-muted rounded" />

            {/* Created By */}
            <div className="h-4 bg-muted rounded" />

            {/* Created At */}
            <div className="h-4 bg-muted rounded" />

            {/* Total Expense */}
            <div className="h-4 bg-muted rounded w-24" />

            {/* Actions */}
            <div className="h-6 w-6 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
