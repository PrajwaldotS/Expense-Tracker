export default function UserTableShimmer() {
  return (
    <div className="bg-card border shadow-sm rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 space-y-4">

        {/* Header */}
        <div className="flex gap-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-6 w-24 bg-muted rounded" />
        </div>

        {/* Table Head */}
        <div className="grid grid-cols-9 gap-4 py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-9 gap-4 items-center py-3"
          >
            {/* Profile */}
            <div className="w-8 h-8 bg-muted rounded-full" />

            {/* Name */}
            <div className="h-4 bg-muted rounded col-span-1" />

            {/* Email */}
            <div className="h-4 bg-muted rounded col-span-1" />

            {/* DOB */}
            <div className="h-4 bg-muted rounded col-span-1" />

            {/* Zones */}
            <div className="h-6 bg-muted rounded col-span-1" />

            {/* Created */}
            <div className="h-4 bg-muted rounded col-span-1" />

            {/* Last Login */}
            <div className="h-4 bg-muted rounded col-span-1" />

            {/* Status */}
            <div className="h-6 bg-muted rounded col-span-1" />

            {/* Actions */}
            <div className="h-6 w-6 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
