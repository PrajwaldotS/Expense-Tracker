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

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
  const [zones, setZones] = useState<any[]>([])
  const [assignedZones, setAssignedZones] = useState<string[]>([])

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    dob: '',
    id_proof_type: '',
    role: 'user',
    status: 'active',
    profilePhoto: null as File | null,
  })

  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetUserEmail, setResetUserEmail] = useState<string | null>(null)
  const [resetForm, setResetForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    checkAdmin()
    fetchUsers()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'admin') router.push('/Dashboard')
    setLoading(false)
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/user')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
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

  const openEditDialog = (u: any) => {
    setEditingUser(u)
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      dob: u.dob ? u.dob.split('T')[0] : '',
      id_proof_type: u.id_proof_type || '',
      role: u.role || 'user',
      status: u.banned_until ? 'disabled' : 'active',
      profilePhoto: null,
    })
  }

  const saveUserEdit = async () => {
  if (!editingUser) return

  let profileUrl = editingUser.profile_photo_url || null

  // Upload profile photo (client side is OK)
  if (editForm.profilePhoto) {
    const ext = editForm.profilePhoto.name.split('.').pop() || 'jpg'
    const filePath = `profiles/${editingUser.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, editForm.profilePhoto, { upsert: true })

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    profileUrl = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath).data.publicUrl
  }

  // Send update to ADMIN API (bypasses RLS)
  const res = await fetch('/api/admin/update-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: editingUser.id,
      name: editForm.name,
      email: editForm.email,
      dob: editForm.dob,
      id_proof_type: editForm.id_proof_type,
      profile_photo_url: profileUrl,
      role: editForm.role,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error || 'Failed to update user')
    return
  }

  setEditingUser(null)
  fetchUsers()
}


  const openResetPassword = (email: string) => {
    setResetUserEmail(email)
    setResetDialogOpen(true)
    setResetForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
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
  const handleResetPassword = async () => {
    if (!resetUserEmail) return

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      return alert('Passwords do not match')
    }

    setResetLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: resetUserEmail,
      password: resetForm.currentPassword,
    })

    if (error) {
      setResetLoading(false)
      return alert('Current password incorrect')
    }

    await supabase.auth.updateUser({ password: resetForm.newPassword })

    setResetLoading(false)
    setResetDialogOpen(false)
    alert('Password updated')
  }
  const isInactiveFor3Days = (lastSignIn: string | null) => {
  if (!lastSignIn) return true // never logged in → inactive

  const last = new Date(lastSignIn).getTime()
  const now = Date.now()

  const diffInDays = (now - last) / (1000 * 60 * 60 * 24)
  return diffInDays >= 3
}
  const filteredUsers = users.filter(u =>
    ((u.name || u.email || '').toLowerCase()).includes(search.toLowerCase())
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
                    <img
                      src={u.profile_photo_url || '/avatar-placeholder.png'}
                      onClick={() => {
                        if (u.profile_photo_url) setPreviewImage(u.profile_photo_url)
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/avatar-placeholder.png'
                      }}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                    />
                  </TableCell>


                  <TableCell className="font-medium text-blue-400 rounded-md">
                    {u.user_metadata?.name || u.email.split('@')[0]}
                  </TableCell>

                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.dob ? new Date(u.dob).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    {u.id_proof_type && u.id_proof_url ? (
                      <a
                        href={u.id_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {u.id_proof_type}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>


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
                    {isInactiveFor3Days(u.last_sign_in_at) ? (
                      <span className="px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-500">
                        Inactive
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-500">
                        Active
                      </span>
                    )}
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
                        <DropdownMenuItem onClick={() => openResetPassword(u.email)}>Reset Password</DropdownMenuItem>
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
  <DialogContent className="max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
    </DialogHeader>

    <div className="grid gap-4 py-4">

      {/* Profile Photo */}
      <div>
        <Label>Profile Photo</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setEditForm({
              ...editForm,
              profilePhoto: e.target.files?.[0] || null,
            })
          }
        />
        {editingUser?.profile_photo_url && (
          <img
            src={editingUser.profile_photo_url}
            className="w-16 h-16 mt-2 rounded-full object-cover"
          />
        )}
      </div>

      {/* Name */}
      <div>
        <Label>Name</Label>
        <Input
          value={editForm.name}
          onChange={(e) =>
            setEditForm({ ...editForm, name: e.target.value })
          }
        />
      </div>

      {/* Email */}
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={editForm.email}
          onChange={(e) =>
            setEditForm({ ...editForm, email: e.target.value })
          }
        />
      </div>

      {/* DOB */}
      <div>
        <Label>Date of Birth</Label>
        <Input
          type="date"
          value={editForm.dob}
          onChange={(e) =>
            setEditForm({ ...editForm, dob: e.target.value })
          }
        />
      </div>

      {/* Aadhaar / ID Proof Type */}
      <div>
        <Label>ID Proof Type</Label>
        <select
          value={editForm.id_proof_type}
          onChange={(e) =>
            setEditForm({ ...editForm, id_proof_type: e.target.value })
          }
          className="w-full border rounded px-2 py-2"
        >
          <option className='bg-card text-foreground' value="">Select</option>
          <option className='bg-card text-foreground' value="aadhaar">Aadhaar</option>
          <option className='bg-card text-foreground' value="pan">PAN</option>
          <option className='bg-card text-foreground' value="driving_license">Driving Licence</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <select
          value={editForm.status}
          onChange={(e) =>
            setEditForm({ ...editForm, status: e.target.value })
          }
          className="w-full border rounded px-2 py-2"
        >
          <option className='bg-card text-foreground' value="active">Active</option>
          <option className='bg-card text-foreground' value="disabled">Disabled</option>
        </select>
      </div>

      {/* Role (existing) */}
      <div>
        <Label>Role</Label>
        <select
          value={editForm.role}
          onChange={(e) =>
            setEditForm({ ...editForm, role: e.target.value })
          }
          className="w-full border rounded px-2 py-2"
        >
          <option className='bg-card text-foreground' value="user">User</option>
          <option className='bg-card text-foreground' value="admin">Admin</option>
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
      {/* Image Preview Modal */}
<Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Profile Photo</DialogTitle>
    </DialogHeader>

    {previewImage && (
      <img
        src={previewImage}
        onError={(e) => {
          e.currentTarget.src = '/avatar-placeholder.png'
        }}
        className="w-full max-h-[70vh] object-contain rounded-lg"
      />
    )}
  </DialogContent>
</Dialog>
{/* Reset Password Dialog */}
<Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reset Password</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label>Current Password</Label>
        <Input
          type="password"
          value={resetForm.currentPassword}
          onChange={(e) =>
            setResetForm({ ...resetForm, currentPassword: e.target.value })
          }
        />
      </div>

      <div>
        <Label>New Password</Label>
        <Input
          type="password"
          value={resetForm.newPassword}
          onChange={(e) =>
            setResetForm({ ...resetForm, newPassword: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Confirm New Password</Label>
        <Input
          type="password"
          value={resetForm.confirmPassword}
          onChange={(e) =>
            setResetForm({ ...resetForm, confirmPassword: e.target.value })
          }
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="secondary" onClick={() => setResetDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleResetPassword} disabled={resetLoading}>
        {resetLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



    </ProtectedRoute>
  )
}
