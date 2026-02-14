'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FiSearch} from 'react-icons/fi'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import ZoneSummaryShimmer from '@/components/skeletons/zoneReportSkeleton'

export default function ZoneSummaryPage() {
  const [zones, setZones] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  
  const CHART_COLORS = [
  '#00bbf9',
  '#f15bb5',
  '#00f5d4',
  '#9b5de5',
  '#fee440',
  '#ff6d00',
  '#8338ec',
]
  const pieData = zones.map((z) => ({
  name: z.name,
  value: Number(z.total_expenses) || 0,
}))

 const fetchZones = async () => {
  setLoading(true)

  const token = localStorage.getItem('token')

  const res = await fetch(
    `http://localhost:2294/api/admin/zone-summary?page=${page}&pageSize=${pageSize}&search=${search}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const result = await res.json()

  if (!res.ok) {
    setZones([])
    setTotalPages(1)
    setLoading(false)
    return
  }

  setZones(result.data || [])
  setTotalPages(result.totalPages || 1)
  setLoading(false)
}

  useEffect(() => {
    fetchZones()
  }, [page, pageSize, search])
  if (loading) return <ZoneSummaryShimmer />
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Zone Summary Report</h1>
          <p className="text-sm text-muted-foreground">
            Overview of zone creation and associated expense activity
          </p>
        </div>
        {/* charts  */}
        {/* PIE CHART */}
<div className="bg-card border shadow-sm rounded-xl p-6">
  <h2 className="text-lg font-semibold mb-1 text-foreground">
    Expenses Distribution by Zone
  </h2>
  <p className="text-sm text-muted-foreground mb-4">
    Visual breakdown of total expenses across zones
  </p>

  {pieData.length === 0 ? (
    <p className="text-sm text-muted-foreground">No data available</p>
  ) : (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={55}
            paddingAngle={3}
          >
            {pieData.map((_, index) => (
              <Cell
                key={index}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>

         <Tooltip
            formatter={(value) => {
              if (typeof value !== 'number') return '₹ 0'
              return (
                <div className="">₹ {value.toLocaleString('en-IN')}</div>
              )
            }}
          />


          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )}
</div>


        {/* SEARCH */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search zone name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 focus-visible:ring-[#00bbf9]"
          />
        </div>

        {/* TABLE CARD */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Total Expenses</TableHead>
                <TableHead>Expense Count</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {zones.map((z) => (
                <TableRow key={z.id} className="hover:bg-muted/40 transition">
                  <TableCell className="font-medium  flex items-center gap-2">
                     <span className="px-2 py-1 rounded-md bg-cyan-900 text-white text-xs font-medium">
                      {z.name} 
                    </span>
                  </TableCell>

                  <TableCell className='text-foreground'>
                    {new Date(z.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {z.created_by || '—'}
                  </TableCell>

                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {Number(z.total_expenses).toLocaleString('en-IN')}
                  </TableCell>

                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-[#00f5d4]/10 text-[#00f5d4] text-xs font-medium">
                      {z.expense_count} records
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages || 1}
            </span>
            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00f5d4] outline-none"
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
