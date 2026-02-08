'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { FaRupeeSign } from 'react-icons/fa'
import { FiMapPin, FiClock } from 'react-icons/fi'
import UserDashboardShimmer from '@/components/skeletons/userDashboardSkeleton'

/* ---------------- TYPES ---------------- */

type ExpenseCategoryRow = {
  amount: number
  categories: {
    name: string
  } | null
}

type LastExpense = {
  amount: number
  expense_date: string
  categories: {
    name: string
  } | null
}
type UserZoneRow = {
  zones: {
    name: string
  }[] | null
}


export default function UserDashboard() {
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [zones, setZones] = useState<string[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [lastExpense, setLastExpense] = useState<LastExpense | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const COLORS = [
    '#00bbf9',
    '#f15bb5',
    '#00f5d4',
    '#9b5de5',
    '#fee440',
    '#ff6d00',
  ]

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    /* -------- TOTAL EXPENSE -------- */
    const { data: expenseRows } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)

    const total =
      expenseRows?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

    setTotalSpent(total)

    /* -------- ZONES -------- */
    const { data: zoneLinks } = await supabase
  .from('user_zones')
  .select('zones(name)')
  .eq('user_id', user.id)
  .returns<UserZoneRow[]>()

const zoneNames =
  zoneLinks
    ?.flatMap((z) => z.zones ?? [])
    .map((zone) => zone.name) || []

setZones(zoneNames)


    /* -------- CATEGORY PIE -------- */
    const { data: categoryRows } = await supabase
      .from('expenses')
      .select('amount, categories(name)')
      .eq('user_id', user.id)
      .returns<ExpenseCategoryRow[]>()

    const categoryMap: Record<string, number> = {}

    categoryRows?.forEach((row) => {
      const name = row.categories?.name ?? 'Other'
      categoryMap[name] = (categoryMap[name] || 0) + Number(row.amount)
    })

    setCategoryData(
      Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }))
    )

    /* -------- LAST EXPENSE -------- */
    const { data: last } = await supabase
      .from('expenses')
      .select('amount, expense_date, categories(name)')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })
      .limit(1)
      .returns<LastExpense[]>()

    setLastExpense(last?.[0] ?? null)

    setLoading(false)
  }

 if (loading) {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4">
        <UserDashboardShimmer />
      </div>
    </ProtectedRoute>
  )
}
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your expenses and allocations
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* TOTAL EXPENSE */}
          <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
            <div className="p-4 rounded-lg bg-[#f15bb5]/10 text-[#f15bb5]">
              <FaRupeeSign size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-semibold">
                ₹ {totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* ZONES */}
          <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
            <div className="p-4 rounded-lg bg-[#00bbf9]/10 text-[#00bbf9]">
              <FiMapPin size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zones Allocated</p>
              <p className="text-2xl font-semibold">{zones.length}</p>
              <p className="text-xs text-muted-foreground">
                {zones.length > 0 ? zones.join(', ') : 'No zones assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* CATEGORY PIE CHART */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">
            Category-wise Spending
          </h2>

          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses yet
            </p>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(v) =>
                      typeof v === 'number'
                        ? `₹ ${v.toLocaleString('en-IN')}`
                        : '₹ 0'
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* LAST EXPENSE */}
        <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-[#9b5de5]/10 text-[#9b5de5]">
            <FiClock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Expense</p>

            {lastExpense ? (
              <p className="font-medium">
                ₹ {lastExpense.amount.toLocaleString('en-IN')} •{' '}
                {lastExpense.categories?.name ?? 'Other'} •{' '}
                {new Date(lastExpense.expense_date).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No expenses yet
              </p>
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}
