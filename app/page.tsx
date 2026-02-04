'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const logoutUser = async () => {
      await supabase.auth.signOut()
    }
    logoutUser()
  }, [])

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
    <div className="min-h-screen flex bg-background">

      {/* LEFT SIDE — Branding & Finance Feel */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 dark:bg-black relative overflow-hidden text-white p-12 flex-col justify-between border-r border-border">
        <div className="absolute inset-0 bg-linear-to-br from-brand/20 via-transparent to-transparent opacity-40"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div>
          <h1 className="text-7xl font-bold mb-4 relative z-10 tracking-tight">Expense Tracker</h1>
          <p className="text-lg text-slate-300 relative z-10 max-w-md">
            Smart expense monitoring for teams and startups.
          </p>
        </div>

        <div className="space-y-6 text-xl text-slate-300 font-medium relative z-10">
          <div>✔ Track daily spending</div>
          <div>✔ Monitor category budgets</div>
          <div>✔ Visualize financial trends</div>
        </div>

        <p className="text-sm text-slate-400 font-mono opacity-70 relative z-10">
          Secure • Reliable • Built for finance clarity
        </p>
      </div>

      {/* RIGHT SIDE — Login Card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md bg-card rounded-xl shadow-none lg:shadow-2xl border border-border p-8 lg:p-10">

          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Login to access your expense dashboard
          </p>

          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={login}
              className="w-full bg-brand hover:bg-brand/90 text-brand-foreground py-2.5 rounded-lg font-medium shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log In
            </button>

            <p className="text-center text-xs text-muted-foreground mt-6">
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
