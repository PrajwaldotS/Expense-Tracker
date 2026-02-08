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
import { FiSearch, FiPieChart } from 'react-icons/fi'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'


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
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') router.push('/Dashboard')
    else setLoading(false)
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

  const filteredCategories = useMemo(() => {
    return categoryTotals.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [categoryTotals, search])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  const areaChartData = categoryTotals.map((c) => ({
  name: c.name,
  total: Number(c.total) || 0,
}))

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  if (loading) return <p className="p-6">Loading category insights...</p>

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Category Spending Overview</h1>
          <p className="text-sm text-muted-foreground">
            Track how expenses are distributed across categories
          </p>
        </div>

        {/* TOTAL EXPENSE CARD */}
        <div className="bg-card border shadow-sm rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-purple-200 text-purple-600"> 
            <FiPieChart size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses Across Categories</p>
            <p className="text-2xl font-semibold text-purple-500">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
            {/* CATEGORY EXPENSE AREA CHART */}
<div className="bg-card border shadow-sm rounded-xl p-6">
  <h2 className="text-lg font-semibold text-foreground mb-1">
    Category-wise Expense Distribution
  </h2>
  <p className="text-sm text-muted-foreground mb-4">
    Visual comparison of expenses across categories
  </p>

  {areaChartData.length === 0 ? (
    <p className="text-sm text-muted-foreground">No data available</p>
  ) : (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={areaChartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />

          <YAxis
            tickFormatter={(value) =>
              typeof value === 'number'
                ? `₹${value / 1000}k`
                : ''
            }
          />

          <Tooltip
            formatter={(value) => {
              if (typeof value !== 'number') return '₹ 0'
              return `₹ ${value.toLocaleString('en-IN')}`
            }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#9b5de5"
            fill="#9b5de5"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )}
</div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
          />
        </div>

        {/* CATEGORY TABLE */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Expense</TableHead>
                <TableHead>Last Expense Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedCategories.map((c, index) => (
                <TableRow key={c.category_id} className="hover:bg-muted/40 transition">
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-purple-500">
                    {c.name}
                  </TableCell>
                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {c.total.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    {c.last_expense_date
                      ? new Date(c.last_expense_date).toLocaleDateString()
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
            <option className='bg-card text-foreground' value={5}>5 / page</option>
            <option className='bg-card text-foreground' value={10}>10 / page</option>
            <option className='bg-card text-foreground' value={20}>20 / page</option>
          </select>
        </div>

      </div>
    </ProtectedRoute>
  )
}
