'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'


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
  }, [])

  const fetchExpenses = async () => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('expenses')
      .select('id, amount, description, expense_date, category_id, categories(name)', { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('categories.name', `%${search}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    if (fromDate) query = query.gte('expense_date', fromDate)
    if (toDate) query = query.lte('expense_date', toDate)

    const { data, count, error } = await query
    if (!error) {
      setExpenses(data || [])
      setTotalPages(Math.ceil((count || 0) / pageSize))
    }
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

  return (
    <div className="w-4/5 mx-auto mt-18">
      <h1 className="text-2xl font-bold mb-2">Manage Expenses</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <Input
          placeholder="Search category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} />
        <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
      </div>

      {/* Table */}
      <Table className="border rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>₹{e.amount}</TableCell>
              <TableCell>{e.categories?.name}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className='size-8'>
                      <MoreHorizontalIcon/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditDialog(e)}>Edit</DropdownMenuItem>
                    <Separator/>
                     <DropdownMenuItem onClick={() => deleteExpense(e.id)} className='text-red-600' >Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>

        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="border rounded px-3 py-2">
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
                className="w-full border rounded px-2 py-1"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingExpense(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
