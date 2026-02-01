'use client'
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

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') router.push('/Disableashboard')
      else fetchUsers()
    }
    checkAdmin()
  }, [router])

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

  const toggleDisable = async (u: any) => {
    await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: u.id,
        name: u.user_metadata?.name || u.email.split('@')[0],
        role: 'user',
        disabled: !u.banned_until
      }),
    })
    fetchUsers()
  }

  const editUser = async (u: any) => {
    const name = prompt('Enter new name', u.user_metadata?.name || '')
    const role = prompt('Enter role (admin/user)', 'user')
    if (!name || !role) return

    await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id, name, role, disabled: !!u.banned_until }),
    })

    fetchUsers()
  }

  if (loading) return <p className="p-6">Loading users...</p>

  return (
    <div className="p-6 my-20">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>

      <table className="w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t text-center">
              <td>{u.user_metadata?.name || u.email.split('@')[0]}</td>
              <td>{u.email}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}</td>
              <td>{u.banned_until ? 'Disabled' : 'Active'}</td>
              <td className="flex justify-center gap-2 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editUser(u)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetPassword(u.id)}>Reset Password</DropdownMenuItem>
                    <Separator/>
                    <DropdownMenuItem onClick={() => deleteUser(u.id)} className='text-red-600'>Delete User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
