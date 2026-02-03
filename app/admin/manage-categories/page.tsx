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

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any | null>(null)

  const [form, setForm] = useState({
    name: '',
    created_by: '',
    created_at: ''
  })

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('admin_category_summary')
      .select('*')
      .order('created_at', { ascending: false })

    setCategories(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('id,name')
    setUsers(data || [])
  }

  useEffect(() => {
    fetchCategories()
    fetchUsers()
  }, [])

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const openEditDialog = (cat: any) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      created_by: cat.created_by || '',
      created_at: cat.created_at?.split('T')[0] || ''
    })
  }

  const saveEdit = async () => {
    if (!editingCategory) return

    await supabase
      .from('categories')
      .update({
        name: form.name,
        created_by: form.created_by || null,
        created_at: form.created_at
      })
      .eq('id', editingCategory.id)

    setEditingCategory(null)
    fetchCategories()
  }

  return (
    <ProtectedRoute>
      <div className="w-5/6 mx-auto mt-20">
        <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

        <Table className="border rounded-xl">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Total Expense</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.created_by || '—'}</TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                <TableCell>₹{Number(c.total_expense).toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditDialog(c)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteCategory(c.id)}
                        className="text-red-600"
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

        {/* EDIT DIALOG */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Category Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Created By</Label>
                <select
                  value={form.created_by}
                  onChange={(e) => setForm({ ...form, created_by: e.target.value })}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Created At</Label>
                <Input
                  type="date"
                  value={form.created_at}
                  onChange={(e) => setForm({ ...form, created_at: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  )
}
