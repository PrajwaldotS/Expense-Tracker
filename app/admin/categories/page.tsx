'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
  const router = useRouter()
  const [totalSpent, setTotalSpent] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    fetchTotals()
    checkAdmin()
  }, [router])

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
      } else {
        setLoading(false)
      }
    }
  const fetchTotals = async () => {
    const { data: totals, error } = await supabase
      .from('admin_category_expense_totals')
      .select('*')

    if (error) {
      console.error(error.message)
      setLoading(false)
      return
    }

    const { data: expenses } = await supabase.from('expenses').select('amount')

    const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0

    setTotalSpent(total)
    setCategoryTotals(totals || [])
    setLoading(false)
  }

  // 🔍 Search filter
  const filteredCategories = useMemo(() => {
    return categoryTotals.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [categoryTotals, search])

  // 📄 Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  if (loading) return <p className="p-6">Loading category insights...</p>

  return (
    <ProtectedRoute >
      <div className="grid grid-cols-1 gap-4 justify-center my-20">

        {/* 💰 Total Expense */}
        <div className="h-[20dvh] bg-gray-200 rounded-xl mx-6 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-center">
            Total Amount Based on Categories <br /> ₹ {totalSpent.toLocaleString('en-IN')}
          </h1>
        </div>

        {/* 🔍 Search */}
        <div className="mx-6">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="mb-4 w-full max-w-sm px-3 py-2 border rounded-md"
          />
        </div>

        {/* 📊 Table */}
        <Table className="border m-5 w-[95%]">
          <TableHeader>
            <TableRow className='bg-gray-200'>
              <TableHead>No</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total Expense</TableHead>
              <TableHead>Last Expense Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCategories.map((c, index) => (
              <TableRow key={c.category_id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>₹{c.total.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  {c.last_expense_date
                    ? new Date(c.last_expense_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 📄 Pagination */}
        <div className="flex justify-between items-center mx-6 mt-4">
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="border rounded px-3 py-2"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

      </div>
    </ProtectedRoute>
  )
}
