'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiSearch } from 'react-icons/fi'

export default function ZoneReportsPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    expense_date: ''
  })

  const fetchExpenses = async () => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('expenses')
      .select(`
        id,
        amount,
        description,
        expense_date,
        users(name),
        categories(name),
        zones(name)
      `, { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(
        `description.ilike.%${search}%,users.name.ilike.%${search}%,categories.name.ilike.%${search}%,zones.name.ilike.%${search}%`
      )
    }

    const { data, count } = await query
    setExpenses(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, pageSize, search])

  const deleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  const openEditDialog = (e: any) => {
    setEditingExpense(e)
    setEditForm({
      amount: e.amount,
      description: e.description,
      expense_date: e.expense_date
    })
  }

  const saveEdit = async () => {
    if (!editingExpense) return
    await supabase.from('expenses').update({
      amount: Number(editForm.amount),
      description: editForm.description,
      expense_date: editForm.expense_date
    }).eq('id', editingExpense.id)

    setEditingExpense(null)
    fetchExpenses()
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-[#1e293b]">Zone Expense Reports</h1>
          <p className="text-sm text-muted-foreground">
            View and manage expenses grouped across zones, users, and categories
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search user, category, zone or description..."
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
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/40 transition">
                  <TableCell className="font-medium">{e.users?.name || '—'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-purple-200 text-purple-600 text-xs">
                      {e.categories?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-cyan-900 text-white text-xs">
                      {e.zones?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">
                    ₹ {Number(e.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    {e.expense_date
                      ? new Date(e.expense_date).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
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
            <option className='text-foreground bg-card' value={5}>5 / page</option>
            <option className='text-foreground bg-card' value={10}>10 / page</option>
            <option className='text-foreground bg-card' value={20}>20 / page</option>
            <option className='text-foreground bg-card' value={50}>50 / page</option>
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
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditingExpense(null)}>Cancel</Button>
              <Button className="bg-primary hover:bg-[#009edc]" onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  )
}
