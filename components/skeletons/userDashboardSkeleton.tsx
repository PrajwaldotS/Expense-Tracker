export default function UserDashboardShimmer() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TOTAL EXPENSE CARD */}
        <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-6 w-40 bg-muted rounded" />
          </div>
        </div>

        {/* ZONES CARD */}
        <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
        </div>

      </div>

      {/* PIE CHART SHIMMER */}
      <div className="bg-card border rounded-xl p-6">
        <div className="h-5 w-56 bg-muted rounded mb-4" />

        <div className="flex justify-center items-center h-80">
          <div className="w-56 h-56 rounded-full bg-muted" />
        </div>
      </div>

      {/* LAST EXPENSE CARD */}
      <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>

    </div>
  )
}
