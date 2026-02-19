'use client'

import { useEffect, useState } from 'react'
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

export default function UserDashboard() {
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [zones, setZones] = useState<string[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [lastExpense, setLastExpense] = useState<any | null>(null)
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
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:2294/api/users/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) return

      const data = await res.json()

      setTotalSpent(data.totalSpent || 0)
      setZones(data.zones || [])
      setCategoryData(data.categoryData || [])
      setLastExpense(data.lastExpense || null)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
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

        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your expenses and allocations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

        <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-[#9b5de5]/10 text-[#9b5de5]">
            <FiClock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Expense</p>

            {lastExpense ? (
              <p className="font-medium">
                ₹ {lastExpense.amount.toLocaleString('en-IN')} •{' '}
                {lastExpense.category?.name ?? 'Other'} •{' '}
                {new Date(lastExpense.expenseDate).toLocaleDateString()}
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
