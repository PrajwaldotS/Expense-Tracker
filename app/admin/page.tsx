'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LogoutButton from '@/components/Logout'

export default function AdminDashboard() {
  const router = useRouter()

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
  }, [])

 const fetchUserTotals = async () => {
  const { data, error  } = await supabase
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
  const { data,error } = await supabase
    .from('admin_category_expense_totals')
    .select('*')

  if (error) {
    console.error('Category totals error:', error.message)
    return
  }

  setCategoryTotals(data || [])
}

  if (loading) return <p>Loading admin insights...</p>

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <LogoutButton />

      <h3>Total Expense Per User</h3>
{userTotals.map((u: any) => (
  <div key={u.user_id}>
    {u.name} — ₹{u.total}
  </div>
))}
     <h3>Total Expense Per Category</h3>
{categoryTotals.map((c: any) => (
  <div key={c.category_id}>
    {c.name} — ₹{c.total}
  </div>
))}
    </div>
  )
}
