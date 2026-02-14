'use client'

import { useEffect, useState, useMemo } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import CategoryTableShimmer from '@/components/skeletons/manageCategoriesSkeleton'
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

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any | null>(null)

  const [form, setForm] = useState({
    name: '',
    created_by: '',
    created_at: ''
  })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:2294/api/categories/categories-summary', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    setCategories(data || [])
    setLoading(false)
  }

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:2294/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    setUsers(data || [])
  }

  useEffect(() => {
    if (!token) return
    fetchCategories()
    fetchUsers()
  }, [])

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return

    await fetch(`http://localhost:2294/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

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

    await fetch(`http://localhost:2294/api/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.name,
        createdBy: form.created_by || null,
        createdAt: form.created_at
      })
    })

    setEditingCategory(null)
    fetchCategories()
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  if (loading) return <CategoryTableShimmer />

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">
            Edit, track, and maintain expense categories
          </p>
        </div>

        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 focus-visible:ring-[#9b5de5]"
          />
        </div>

        <div className="bg-card border shadow-sm rounded-xl overflow-hidden mb-5">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Total Expense</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedCategories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-purple-500">
                    {c.name}
                  </TableCell>
                  <TableCell>{c.created_by || '—'}</TableCell>
                  <TableCell>
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {Number(c.total_expense).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(c)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteCategory(c.id)}
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
      <Dialog
  open={!!editingCategory}
  onOpenChange={(open) => {
    if (!open) setEditingCategory(null)
  }}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Category</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-2">
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="ghost" onClick={() => setEditingCategory(null)}>
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
