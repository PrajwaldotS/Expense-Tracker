'use client'

import { Shimmer } from '@/components/ui/shimmer'

export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">

      {/* TOTAL EXPENSE CARD */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <Shimmer className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-6 w-40" />
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-6 w-12" />
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-6 w-12" />
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-6 w-12" />
        </div>
      </div>
    </div>
  )
}
