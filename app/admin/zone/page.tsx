'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FiSearch, FiMap } from 'react-icons/fi'

export default function ZoneSummaryPage() {
  const [zones, setZones] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)

  const fetchZones = async () => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('admin_zone_summary')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('name', `%${search}%`)

    const { data, count } = await query
    setZones(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
  }

  useEffect(() => {
    fetchZones()
  }, [page, pageSize, search])

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
