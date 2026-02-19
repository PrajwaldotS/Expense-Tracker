'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
import CategoryOverviewShimmer from '@/components/skeletons/categoryReportSkeleton'

export default function CategoriesPage() {
  const [totalSpent, setTotalSpent] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCategorySummary = async () => {
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(
        `http://localhost:2294/api/dashboard/reports/categories?page=${page}&pageSize=${pageSize}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        
      )

      const result = await res.json()
      

      if (!res.ok) {
        setCategoryTotals([])
        setTotalSpent(0)
        setTotalPages(1)
        setLoading(false)
        return
      }

      setCategoryTotals(result.data || [])
      setTotalSpent(result.totalPlatformExpense || 0)
      setTotalPages(result.totalPages || 1)
    } catch (error) {
      console.error('Fetch error:', error)
      setCategoryTotals([])
      setTotalSpent(0)
      setTotalPages(1)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCategorySummary()
  }, [page, pageSize, search])

  const areaChartData = categoryTotals.map((c) => ({
    name: c.name,
    total: Number(c.total) || 0,
  }))

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto mt-20 px-4">
          <CategoryOverviewShimmer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Category Spending Overview
          </h1>
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
            <p className="text-sm text-muted-foreground">
              Total Expenses Across Categories
            </p>
            <p className="text-2xl font-semibold text-purple-500">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* AREA CHART */}
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Category-wise Expense Distribution
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visual comparison of expenses across categories
          </p>

          {areaChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No data available
            </p>
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
          />
        </div>

        {/* TABLE */}
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
              {categoryTotals.map((c, index) => (
                <TableRow
                  key={c.categoryId}
                  className="hover:bg-muted/40 transition"
                >
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>

                  <TableCell className="font-medium text-purple-500">
                    {c.name}
                  </TableCell>

                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {Number(c.total).toLocaleString('en-IN')}
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
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted disabled:opacity-50"
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
