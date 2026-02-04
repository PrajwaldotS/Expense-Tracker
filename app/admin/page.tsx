'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FiUsers, FiFolder, FiDollarSign } from 'react-icons/fi'

export default function AdminDashboard() {
  const router = useRouter()
  const [totalSpent, setTotalSpent] = useState(0)
  const [userTotals, setUserTotals] = useState<[string, number][]>([])
  const [categoryTotals, setCategoryTotals] = useState<[string, number][]>([])
  const [loading, setLoading] = useState(true)

  // 🔒 Protect admin route
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .order('created_at', { ascending: false })
        .single()

      if (data?.role !== 'admin') {
        router.push('/Dashboard')
      }
    }

    checkAdmin()
  }, [router])

  // 📊 Fetch totals
  useEffect(() => {
    fetchUserTotals()
    fetchCategoryTotals()
    fetchTotalSpent()
  }, [])

  const fetchUserTotals = async () => {
    const { data, error } = await supabase
      .from('admin_user_expense_totals')
      .select('*')

    if (error) {
      console.error('User totals error:', error.message)
      setLoading(false)
      return
    }

    setUserTotals(data || [])
    setLoading(false)
  }

  const fetchCategoryTotals = async () => {
    const { data, error } = await supabase
      .from('admin_category_expense_totals')
      .select('*')

    if (error) {
      console.error('Category totals error:', error.message)
      return
    }

    setCategoryTotals(data || [])
  }

  const fetchTotalSpent = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')

    if (error) {
      console.error(error.message)
      return
    }

    const total = data.reduce((sum, e) => sum + e.amount, 0)
    setTotalSpent(total)
  }

  if (loading) return <p className="p-6">Loading admin insights...</p>

  return (
    <div className="p-6 space-y-8 mt-16">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1e293b]">Admin Financial Overview</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of user spending and category distribution
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* TOTAL SPENT */}
        <div className="rounded-xl bg-white shadow-sm border p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#f15bb5]/10 text-[#f15bb5]">
            <FiDollarSign size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-semibold text-[#1e293b]">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* TOTAL USERS */}
        <div className="rounded-xl bg-white shadow-sm border p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#00bbf9]/10 text-[#00bbf9]">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-xl font-semibold text-[#1e293b]">
              {userTotals.length}
            </p>
          </div>
        </div>

        {/* TOTAL CATEGORIES */}
        <div className="rounded-xl bg-white shadow-sm border p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#9b5de5]/10 text-[#9b5de5]">
            <FiFolder size={22} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expense Categories</p>
            <p className="text-xl font-semibold text-[#1e293b]">
              {categoryTotals.length}
            </p>
          </div>
        </div>

      </div>

      {/* SECONDARY INFO PANELS */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* USER SUMMARY PANEL */}
        <div className="bg-white border shadow-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
            User Expense Distribution
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview of total expenses grouped by users.
          </p>
        </div>

        {/* CATEGORY SUMMARY PANEL */}
        <div className="bg-white border shadow-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
            Category Expense Distribution
          </h2>
          <p className="text-sm text-muted-foreground">
            Overview of spending patterns by category.
          </p>
        </div>

      </div>
    </div>
  )
}
