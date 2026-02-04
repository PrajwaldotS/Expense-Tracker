'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FiUsers, FiFolder, FiDollarSign, FiMapPin } from 'react-icons/fi'

export default function AdminDashboard() {
  const router = useRouter()
  const [totalSpent, setTotalSpent] = useState(0)
  const [userTotals, setUserTotals] = useState<any[]>([])
  const [categoryTotals, setCategoryTotals] = useState<any[]>([])
  const [zoneTotal, setZoneTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // 🔒 Protect admin route
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') router.push('/Dashboard')
    }

    checkAdmin()
  }, [router])

  // 📊 Fetch totals
  useEffect(() => {
    fetchUserTotals()
    fetchCategoryTotals()
    fetchTotalSpent()
    fetchTotalZones()
  }, [])

  const fetchUserTotals = async () => {
    const { data, error } = await supabase
      .from('admin_user_expense_totals')
      .select('*')

    if (!error) setUserTotals(data || [])
    setLoading(false)
  }

  const fetchCategoryTotals = async () => {
    const { data, error } = await supabase
      .from('admin_category_expense_totals')
      .select('*')

    if (!error) setCategoryTotals(data || [])
  }

  const fetchTotalZones = async () => {
    const { count } = await supabase
      .from('zones')
      .select('*', { count: 'exact', head: true })

    setZoneTotal(count || 0)
  }

  const fetchTotalSpent = async () => {
    const { data } = await supabase.from('expenses').select('amount')
    const total = data?.reduce((sum, e) => sum + e.amount, 0) || 0
    setTotalSpent(total)
  }

  if (loading) return <p className="p-6">Loading admin insights...</p>

  return (
    <div className="p-6 space-y-8 mt-16">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin Financial Overview</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of system-wide financial activity
        </p>
      </div>

      {/* 💰 HERO CARD — FULL WIDTH */}
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

      {/* 📊 SECOND ROW — 3 EQUAL CARDS */}
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
