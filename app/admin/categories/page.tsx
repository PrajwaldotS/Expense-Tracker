'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
export default function CategoriesPage() {
  const router = useRouter()
const [totalSpent, setTotalSpent] = useState(0)
const [categoryTotals, setCategoryTotals] = useState<[string, number][]>([])
  const [loading, setLoading] = useState(false)

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
useEffect(() => {
    fetchTotalSpent()
    fetchCategoryTotals()
  }, [])
   if (loading) return <p>Loading... insights</p>
  return (
    <div className="grid grid-cols-1 gap-4 justify-center my-20">
      <div className='h-[20dvh] bg-gray-200 rounded-xl'>
        <h1 className="text-2xl font-bold text-center mt-8">Total Amount Based on Categories <br />
        ₹ {totalSpent}</h1>
      </div>
        <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Total Expense</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categoryTotals.map((c: any, index: number) => (
          <TableRow key={c.category_id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{c.name}</TableCell>
            <TableCell>₹{c.total}</TableCell>
            <TableCell>{c.last_expense_date? new Date(c.last_expense_date).toLocaleDateString(): 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}
