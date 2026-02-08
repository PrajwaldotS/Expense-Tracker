'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from 'lucide-react'
import { FiSearch, FiCalendar } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import ManageExpensesSkeleton from '@/components/skeletons/manageExpensesSkeleton'

export default function ExpenseTable() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    expense_date: '',
    category_id: ''
  })

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => {
      setCategories(data || [])
    })
    checkAdmin()
  }, [router])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'admin') router.push('/Dashboard')
  }

  const fetchExpenses = async () => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('expenses')
      .select('id, amount, description, expense_date, category_id, categories(name),  receipt_url', { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('categories.name', `%${search}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    if (fromDate) query = query.gte('expense_date', fromDate)
    if (toDate) query = query.lte('expense_date', toDate)

    const { data, count } = await query
    setExpenses(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, pageSize, search, selectedCategory, fromDate, toDate])

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  const openEditDialog = (e: any) => {
    setEditingExpense(e)
    setEditForm({
      amount: e.amount,
      description: e.description,
      expense_date: e.expense_date,
      category_id: e.category_id
    })
  }

  const saveEdit = async () => {
    if (!editingExpense) return
    await supabase.from('expenses').update({
      amount: Number(editForm.amount),
      description: editForm.description,
      expense_date: editForm.expense_date,
      category_id: editForm.category_id
    }).eq('id', editingExpense.id)

    setEditingExpense(null)
    fetchExpenses()
  }
  if (loading) {
    return <ManageExpensesSkeleton />
  }
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Filter, edit, and monitor all recorded expenses
          </p>
        </div>

        {/* FILTER CARD */}
        <div className="bg-card border shadow-sm rounded-xl p-4 grid gap-4 md:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10 focus-visible:ring-[#00bbf9]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9b5de5] outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-muted-foreground" />
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} className="pl-10" />
          </div>

          <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
        </div>
        {/* TABLE CARD */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead >Receipt</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/40 transition">
                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {e.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-purple-200 text-purple-600 text-xs">
                      {e.categories?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {e.receipt_url ? (
                      <a
                        href={e.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm font-medium"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No receipt</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.description}</TableCell>
                  <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(e)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteExpense(e.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
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
            <option className='bg-card text-foreground' value={50}>50 / page</option>
          </select>
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Amount</Label>
                <Input value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>

              <div>
                <Label>Description</Label>
                <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>

              <div>
                <Label>Date</Label>
                <Input type="date" value={editForm.expense_date} onChange={(e) => setEditForm({ ...editForm, expense_date: e.target.value })} />
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {categories.map((c) => (
                    <option className='bg-card text-foreground' key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditingExpense(null)}>Cancel</Button>
              <Button className="bg-[#00bbf9] hover:bg-[#009edc]" onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
