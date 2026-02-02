'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontalIcon } from 'lucide-react'

/* ✅ SHADCN TABLE IMPORTS */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
    checkAdmin()
  }, [router])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') {
      router.push('/Dashboard')
    } else {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/user')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  const resetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password')
    if (!newPassword) return

    await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, newPassword }),
    })

    alert('Password updated')
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return

    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })

    fetchUsers()
  }

  const openEditDialog = (u: any) => {
    setEditingUser(u)
    setEditForm({
      name: u.user_metadata?.name || u.email.split('@')[0],
      role: u.role || 'user',
    })
  }

  const saveUserEdit = async () => {
    if (!editingUser) return

    await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editingUser.id,
        name: editForm.name,
        role: editForm.role,
        disabled: !!editingUser.banned_until,
      }),
    })

    setEditingUser(null)
    fetchUsers()
  }

  const filteredUsers = users.filter((u) =>
    (u.user_metadata?.name || u.email.split('@')[0]).toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return <p className="p-6">Loading users...</p>

  return (
    <ProtectedRoute>
      <div className="w-4/5 mx-auto mt-18">
        <h2 className="text-2xl font-bold mb-4">All Users</h2>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="mb-4 w-full max-w-sm px-3 py-2 border rounded-md"
        />

        {/* ✅ SHADCN TABLE */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-200'>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.user_metadata?.name || u.email.split('@')[0]}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {u.banned_until ? 'Disabled' : 'Active'}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(u)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetPassword(u.id)}>
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteUser(u.id)}
                          className="text-red-600"
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Role</Label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveUserEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
