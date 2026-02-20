'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUsers, FiFolder, FiDollarSign, FiMapPin } from 'react-icons/fi'
import AdminDashboardSkeleton from '@/components/skeletons/adminDashboardSkeleton'

export default function AdminDashboard() {
  const router = useRouter()

  const [totalSpent, setTotalSpent] = useState(0)
  const [userTotals, setUserTotals] = useState<any[]>([])
  const [categoryTotals, setCategoryTotals] = useState<any[]>([])
  const [zoneTotal, setZoneTotal] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/dashboard/dashboardReport', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          router.push('/userDashboard')
          return
        }

        const data = await res.json()

        setTotalSpent(data.totalAmount || 0)
        setZoneTotal(data.totalZones || 0)

        // For UI count display
        setUserTotals(Array(data.totalUsers).fill({}))
        setCategoryTotals(Array(data.totalCategories).fill({}))

      } catch (error) {
        console.error(error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-20 px-4">
        <AdminDashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 mt-16">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin Financial Overview</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of system-wide financial activity
        </p>
      </div>

      {/* 💰 HERO CARD */}
      <div className="rounded-2xl bg-card border shadow-sm p-8 flex items-center gap-6">
        <div className="p-4 rounded-xl bg-[#f15bb5]/10 text-[#f15bb5]">
          <FiDollarSign size={32} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-3xl font-bold text-[#f15bb5] mt-1">
            ₹ {totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 📊 SECOND ROW */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* USERS */}
        <div className="rounded-xl bg-card border shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#00bbf9]/10 text-[#00bbf9]">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-xl font-semibold text-[#00bbf9]">
              {userTotals.length}
            </p>
          </div>
        </div>

        {/* ZONES */}
        <div className="rounded-xl bg-card border shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#00f5d4]/10 text-[#00f5d4]">
            <FiMapPin size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Zones</p>
            <p className="text-xl font-semibold text-[#00f5d4]">
              {zoneTotal}
            </p>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="rounded-xl bg-card border shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#9b5de5]/10 text-[#9b5de5]">
            <FiFolder size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expense Categories</p>
            <p className="text-xl font-semibold text-[#9b5de5]">
              {categoryTotals.length}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
