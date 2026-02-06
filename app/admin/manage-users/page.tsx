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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FiSearch } from 'react-icons/fi'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ name: '', role: 'user' })

  const [zones, setZones] = useState<any[]>([])
  const [assignedZones, setAssignedZones] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
    checkAdmin()
  }, [router])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') router.push('/Dashboard')
    else setLoading(false)
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/user')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  const loadZones = async (userId: string) => {
    const { data: allZones } = await supabase.from('zones').select('id,name')
    const { data: userZones } = await supabase.from('user_zones').select('zone_id').eq('user_id', userId)

    setZones(allZones || [])
    setAssignedZones(userZones?.map(z => z.zone_id) || [])
  }

  const toggleZone = async (zoneId: string) => {
    if (!selectedUser) return
    if (assignedZones.includes(zoneId)) {
      await supabase.from('user_zones').delete().eq('user_id', selectedUser.id).eq('zone_id', zoneId)
    } else {
      await supabase.from('user_zones').insert({ user_id: selectedUser.id, zone_id: zoneId })
    }
    loadZones(selectedUser.id)
    fetchUsers()
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
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage access, roles, and assigned operational zones
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
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
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>ID Proof</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40 transition">
                  <TableCell>
                    {u.profile_photo_url ? (
                      <img
                        src={u.profile_photo_url}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        NA
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium text-blue-400 rounded-md">
                    {u.user_metadata?.name || u.email.split('@')[0]}
                  </TableCell>

                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.dob ? new Date(u.dob).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{u.id_proof_type || '—'}</TableCell>

                  <TableCell>
                    <div className="group px-2 py-1 text-center relative rounded-md cursor-pointer bg-brand/10 text-brand">
                      {u.zone_names ? u.zone_names.split(',').length : 0} Zones
                      <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg z-10">
                        {u.zone_names || 'No Zones'}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}</TableCell>

                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      u.banned_until ? 'bg-[#f15bb5]/10 text-destructive' : 'bg-accent/10 text-accent'
                    }`}>
                      {u.banned_until ? 'Disabled' : 'Active'}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(u)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetPassword(u.id)}>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedUser(u); setZoneDialogOpen(true); loadZones(u.id) }}>
                          Manage Zones
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteUser(u.id)} className="text-destructive">
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

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00bbf9] outline-none"
          >
            <option className='bg-card text-foreground' value={5}>5 / page</option>
            <option className='bg-card text-foreground' value={10}>10 / page</option>
            <option className='bg-card text-foreground' value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* Edit User Dialog */}
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
            <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={saveUserEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zone Management Dialog */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Zones for {selectedUser?.email}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {zones.map(z => {
              const has = assignedZones.includes(z.id)
              return (
                <div key={z.id} className="flex justify-between items-center">
                  <span>{z.name}</span>
                  <Button
                    size="sm"
                    variant={has ? 'destructive' : 'default'}
                    onClick={() => toggleZone(z.id)}
                  >
                    {has ? 'Remove' : 'Add'}
                  </Button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

    </ProtectedRoute>
  )
}
