'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const login = async () => {
    setMsg('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role === 'admin') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/Dashboard'
    }
  }

  return (
    <div className="h-dvh flex items-center justify-center bg-linear-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/30 border border-white/40 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Expense Tracker</h1>
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Login
        </h2>

        <div className="flex flex-col gap-4">
          <input
            className="px-4 py-2 rounded-lg text-black bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-600"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="px-4 py-2 rounded-lg text-black bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-600"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="mt-2 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-700">
            Account creation is managed by the administrator.
          </p>

          {msg && (
            <p className="text-center text-sm text-red-600 mt-2">{msg}</p>
          )}
        </div>
      </div>
    </div>
  )
}
