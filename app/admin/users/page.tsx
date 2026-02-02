'use client'

import { useEffect, useState } from 'react'
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

export default function AdminDashboard() {
  const router = useRouter()
  const [totalSpent, setTotalSpent] = useState(0)
  const [userTotals, setUserTotals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    fetchUserTotals()
    fetchTotalSpent()
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

  const fetchTotalSpent = async () => {
    const { data, error } = await supabase.from('expenses').select('amount')
    if (error) return console.error(error.message)

    const total = data.reduce((sum, e) => sum + e.amount, 0)
    setTotalSpent(total)
  }

  // 🔍 Filter users by name
  const filteredUsers = userTotals.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  // 📄 Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  if (loading) return <p className="p-6">Loading admin insights...</p>

  return (
    <ProtectedRoute >
      <div className="grid grid-cols-1 gap-4 justify-center my-20">

        {/* 💰 Total Expense Card */}
        <div className="h-[20dvh] bg-gray-200 rounded-xl mx-6 flex items-center justify-center">
          <h1 className="text-3xl text-center font-bold text-black">
            Total Amount By All Users <br /> ₹{totalSpent.toLocaleString('en-IN')}
          </h1>
        </div>

        {/* 🔍 Search */}
        <div className="mx-6">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="mb-4 w-full max-w-sm px-3 py-2 border rounded-md"
          />
        </div>

        {/* 📊 User Totals Table */}
        <Table className="m-5 overflow-hidden border-2 w-[95%]">
          <TableHeader>
            <TableRow className='bg-gray-200'>
              <TableHead>User No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Total Expense</TableHead>
              <TableHead>Last Expense Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedUsers.map((u, index) => (
              <TableRow key={u.user_id}>
                <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>₹{u.total.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  {u.last_expense_date
                    ? new Date(u.last_expense_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 📄 Pagination Controls */}
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
