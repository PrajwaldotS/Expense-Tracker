'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { FiSearch, FiCalendar } from 'react-icons/fi'

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const fetchExpenses = async () => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('expenses')
      .select('id, amount, description, expense_date, categories(name)', { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('categories.name', `%${search}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    if (fromDate) query = query.gte('expense_date', fromDate)
    if (toDate) query = query.lte('expense_date', toDate)

    const { data, count, error } = await query
    if (error) return console.error(error.message)

    setExpenses(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, pageSize, search, selectedCategory, fromDate, toDate])

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-4 space-y-6">

      {/* 🔎 FILTERS */}
      <div className="bg-card border shadow-sm rounded-xl p-4 grid gap-4 md:grid-cols-4">
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <input
            placeholder="Search category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00bbf9] outline-none"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* From Date */}
        <div className="relative">
          <FiCalendar className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fee440] outline-none"
          />
        </div>

        {/* To Date */}
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fee440] outline-none"
        />
      </div>

      {/* 📊 TABLE */}
      <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id} className="hover:bg-muted/40 transition">
                <TableCell className="font-semibold text-[#f15bb5]">
                  ₹ {e.amount}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs rounded-md bg-[#9b5de5]/10 text-[#9b5de5]">
                    {e.categories?.name}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.description}
                </TableCell>
                <TableCell>
                  {e.expense_date
                    ? new Date(e.expense_date).toLocaleDateString()
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 📄 PAGINATION */}
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
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00f5d4] outline-none"
        >
          <option className='bg-card text-foreground' value={5}>5 / page</option>
          <option className='bg-card text-foreground' value={10}>10 / page</option>
          <option className='bg-card text-foreground' value={20}>20 / page</option>
          <option className='bg-card text-foreground' value={50}>50 / page</option>
        </select>
      </div>
    </div>
  )
}
