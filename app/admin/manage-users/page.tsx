'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 🔒 Protect admin route
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') router.push('/dashboard')
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

  if (loading) return <p className="p-6">Loading users...</p>

  return (
    <div className="p-6 my-20">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>

      <table className="w-full border rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Reset Password</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t text-center">
              <td>{u.user_metadata?.name || u.email.split('@')[0]}</td>
              <td>{u.email}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.last_sign_in_at
                  ? new Date(u.last_sign_in_at).toLocaleString()
                  : 'Never'}
              </td>
              <td>
                {u.banned_until ? 'Disabled' : 'Active'}
              </td>
              <td>
                <button
                  onClick={() => resetPassword(u.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
