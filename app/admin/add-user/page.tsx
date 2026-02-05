'use client'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FiUser, FiMail, FiLock } from 'react-icons/fi'

export default function CreateUserPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const createUser = async () => {
    setMsg('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json()
    if (data.error) setMsg(data.error)
    else {
      setMsg('User created successfully!')
      setEmail('')
      setPassword('')
      setName('')
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') router.push('/Dashboard')
    }

    checkAdmin()
  }, [router])

  return (
    <ProtectedRoute>
      <div className="min-h-[70vh]  px-4 mt-20">
        <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create New User</h2>
            <p className="text-sm  text-muted-foreground">
              Add a new member to the finance system
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium  text-foreground">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-[#9b5de5]" />
                <input
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium  text-foreground">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-[#00bbf9]" />
                <input
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00bbf9] outline-none"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium  text-foreground">Temporary Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-[#f15bb5]" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f15bb5] outline-none"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={createUser}
            className="w-full  hover:bg-blue-600 bg-blue-500 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
          >
            Create User
          </button>

          {/* MESSAGE */}
          {msg && (
            <p className={`text-sm text-center ${msg.includes('success')
              ? 'text-[#00f5d4]'
              : 'text-[#f15bb5]'
              }`}>
              {msg}
            </p>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}
