'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, count, error } = await query

    if (error) {
      console.error(error.message)
      return
    }

    setZones(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
  }

  useEffect(() => {
    fetchZones()
  }, [page, pageSize, search])

  return (
    <ProtectedRoute >
      <div className="w-5/6 mx-auto mt-20">

        <h1 className="text-2xl font-bold mb-6">Zone Summary Report</h1>

        {/* 🔍 Search */}
        <Input
          placeholder="Search zone name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="mb-4 max-w-sm"
        />

        {/* 📊 Table */}
        <Table className="border rounded-xl">
          <TableHeader>
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
              <TableRow key={z.id}>
                <TableCell>{z.name}</TableCell>
                <TableCell>
                  {new Date(z.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{z.created_by || '—'}</TableCell>
                <TableCell>₹{Number(z.total_expenses).toLocaleString('en-IN')}</TableCell>
                <TableCell>{z.expense_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 📄 Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span>Page {page} of {totalPages || 1}</span>
            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
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
