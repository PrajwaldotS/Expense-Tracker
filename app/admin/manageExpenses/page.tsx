'use client'

import { useEffect, useState } from 'react'
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
import ManageExpensesSkeleton from '@/components/skeletons/manageExpensesSkeleton'

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
  const [loading, setLoading] = useState(true)

  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    expense_date: '',
    category_id: ''
  })

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [page, pageSize, search, selectedCategory, fromDate, toDate])

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:2294/api/categories/categories-summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setCategories(data || [])
  }

  const fetchExpenses = async () => {
    setLoading(true)

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      categoryId: selectedCategory,
      fromDate,
      toDate
    })

    const res = await fetch(
      `http://localhost:2294/api/expenses?${query.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const result = await res.json()

    setExpenses(result.data || [])
    setTotalPages(result.totalPages || 1)
    setLoading(false)
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return

    await fetch(`http://localhost:2294/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    fetchExpenses()
  }

  const openEditDialog = (e: any) => {
    setEditingExpense(e)
    setEditForm({
      amount: e.amount,
      description: e.description,
      expense_date: e.expense_date?.split('T')[0],
      category_id: e.category_id
    })
  }

  const saveEdit = async () => {
    if (!editingExpense) return

    await fetch(`http://localhost:2294/api/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: Number(editForm.amount),
        description: editForm.description,
        expenseDate: editForm.expense_date,
        categoryId: editForm.category_id
      })
    })

    setEditingExpense(null)
    fetchExpenses()
  }

  if (loading) return <ManageExpensesSkeleton />

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

        {/* FILTERS */}
        <div className="bg-card border shadow-sm rounded-xl p-4 grid gap-4 md:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} />
          <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
        </div>

        {/* TABLE */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>₹ {e.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{e.category?.name}</TableCell>
                  <TableCell>
                    {e.receiptUrl ? (
                      <a href={e.receiptUrl} target="_blank" className="text-blue-500">
                        View Receipt
                      </a>
                    ) : 'No receipt'}
                  </TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>{new Date(e.expenseDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(e)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteExpense(e.id)}
                          className="text-destructive"
                        >
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

      </div>
      {/* Edit Expense Dialog */}
<Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Expense</DialogTitle>
    </DialogHeader>

    <div className="grid gap-4 py-4">

      {/* Amount */}
      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          value={editForm.amount}
          onChange={(e) =>
            setEditForm({ ...editForm, amount: e.target.value })
          }
        />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <select
          value={editForm.category_id}
          onChange={(e) =>
            setEditForm({ ...editForm, category_id: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Input
          value={editForm.description}
          onChange={(e) =>
            setEditForm({ ...editForm, description: e.target.value })
          }
        />
      </div>

      {/* Date */}
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={editForm.expense_date}
          onChange={(e) =>
            setEditForm({ ...editForm, expense_date: e.target.value })
          }
        />
      </div>

    </div>

    <DialogFooter>
      <Button variant="secondary" onClick={() => setEditingExpense(null)}>
        Cancel
      </Button>
      <Button onClick={saveEdit}>
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </ProtectedRoute>
  )
}
