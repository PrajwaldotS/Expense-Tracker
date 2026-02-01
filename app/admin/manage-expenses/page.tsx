'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'

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

  // Fetch categories for dropdown
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

    // 🔍 Search by category name
    if (search) {
      query = query.ilike('categories.name', `%${search}%`)
    }

    // 🔽 Filter by selected category
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    // 📅 Date range filters
    if (fromDate) {
      query = query.gte('expense_date', fromDate)
    }
    if (toDate) {
      query = query.lte('expense_date', toDate)
    }

    const { data, count, error } = await query

    if (error) {
      console.error(error.message)
      return
    }

    setExpenses(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, pageSize, search, selectedCategory, fromDate, toDate])

  return (
    <div className="w-4/5 mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Manage Expenses</h1>
      {/* 🔎 Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <input
          placeholder="Search category..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="px-4 py-2 border rounded-lg"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 border rounded-lg"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {/* 📊 Table */}
      <Table className="border rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>₹{e.amount}</TableCell>
              <TableCell>{e.categories?.name}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 📄 Pagination + Page Size */}
      <div className="flex justify-between items-center mt-6">

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>Page {page} of {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
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
          className="px-3 py-2 border rounded-lg"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  )
}
