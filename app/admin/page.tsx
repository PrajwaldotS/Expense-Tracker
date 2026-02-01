'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LogoutButton from '@/components/Logout'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
// to calucate the total expense
 useEffect(() => {
  fetchTotalSpent()
  console.log(userTotals)

}, [])


  if (loading) return <p>Loading admin insights...</p>

  return (
    
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-1 justify-center my-20'>
    <div className='h-[20dvh]  bg-gray-200 rounded-xl'>
      <h1 className='text-3xl text-center mt-4 text-black'>Total Amount By the Users <br /> ₹{totalSpent}</h1>
    </div>
    <div className='grid grid-cols-1 gap-4 justify-center my-20'>
      <div className="h-[40dvh] bg-gray-200 rounded-xl">
      <h2 className='text-3xl text-center mt-4 text-black'>Total Expense Per Category</h2>
      <div className='flex flex-wrap justify-center gap-4 p-4'>
        {categoryTotals.map((c: any) => (
          <div key={c.category_id} className='text-black h-10 my-8  m-4 flex items-center justify-between rounded-lg'>
            <h2 className="text-xl bg-black/10 p-4 rounded">{c.name} <br /> ₹{c.total} </h2>
            
          </div>
        ))}
      </div>
      </div>
    </div>
    </div>
  )
}

