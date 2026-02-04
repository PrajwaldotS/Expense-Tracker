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
import {  FiSearch } from 'react-icons/fi'
import { FaRupeeSign } from "react-icons/fa";

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
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') router.push('/Dashboard')
    else setLoading(false)
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

  const filteredUsers = userTotals.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  if (loading) return <p className="p-6">Loading admin insights...</p>

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Spending Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor individual expense contributions across the system
          </p>
        </div>

        {/* TOTAL EXPENSE CARD */}
        <div className="bg-card border shadow-sm rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-[#f15bb5]/10 text-[#f15bb5]">
            <FaRupeeSign size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Platform Expenses</p>
            <p className="text-2xl font-semibold text-foreground">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00bbf9] outline-none"
          />
        </div>

        {/* USER TOTALS TABLE */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Sl No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Expense</TableHead>
                <TableHead>Last Expense Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((u, index) => (
                <TableRow key={u.user_id} className="hover:bg-muted/40 transition">
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-blue-400">
                    {u.name}
                  </TableCell>
                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {u.total.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    {u.last_expense_date
                      ? new Date(u.last_expense_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00f5d4] outline-none"
          >
            <option className='bg-card text-foreground'  value={5}>5 / page</option>
            <option className='bg-card text-foreground' value={10}>10 / page</option>
            <option className='bg-card text-foreground' value={20}>20 / page</option>
          </select>
        </div>
      </div>
    </ProtectedRoute>
  )
}
