'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
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

  // 🔹 search + pagination state
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('admin_category_summary')
      .select('*')
      .order('created_at', { ascending: false })

    setCategories(data || [])
    setLoading(false)
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

  // 🔹 filter + paginate
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
 if (loading) {
    return <CategoryTableShimmer/>
  }
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">
            Edit, track, and maintain expense categories
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 focus-visible:ring-[#9b5de5]"
          />
        </div>

        {/* TABLE CARD */}
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
                <TableRow key={c.id} className="hover:bg-muted/40 transition">
                  <TableCell className="font-medium text-purple-500">
                    {c.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {c.created_by || '—'}
                  </TableCell>

                  <TableCell>
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="font-semibold text-[#f15bb5]">
                    ₹ {Number(c.total_expense).toLocaleString('en-IN')}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="hover:bg-muted">
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

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
            </span>

            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00f5d4] outline-none"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#1e293b]">Edit Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label>Category Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="focus-visible:ring-[#9b5de5]"
                />
              </div>

              <div className="space-y-1">
                <Label>Created By</Label>
                <select
                  value={form.created_by}
                  onChange={(e) => setForm({ ...form, created_by: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00bbf9] outline-none"
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Created At</Label>
                <Input
                  type="date"
                  value={form.created_at}
                  onChange={(e) => setForm({ ...form, created_at: e.target.value })}
                  className="focus-visible:ring-[#fee440]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-[#009edc]" onClick={saveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  )
}
