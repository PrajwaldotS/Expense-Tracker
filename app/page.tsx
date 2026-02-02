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
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT SIDE — Branding & Finance Feel */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-7xl font-bold mb-4">Expense Tracker</h1>
          <p className="text-lg text-blue-100">
            Smart expense monitoring for teams and startups.
          </p>
        </div>

        <div className="space-y-6 text-l text-blue-200">
          <div>✔ Track daily spending</div>
          <div>✔ Monitor category budgets</div>
          <div>✔ Visualize financial trends</div>
        </div>

        <p className="text-2xl text-blue-300 opacity-70">
          Secure • Reliable • Built for finance clarity
        </p>
      </div>

      {/* RIGHT SIDE — Login Card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-200">

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Login to access your expense dashboard
          </p>

          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              />
            </div>

            <button
              onClick={login}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium shadow-md transition"
            >
              Log In
            </button>

            <p className="text-center text-xs text-gray-500">
              Account creation is managed by the administrator.
            </p>

            {msg && (
              <p className="text-center text-sm text-red-600">{msg}</p>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
