'use client'

import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)

  useEffect(() => {
    // Clear any old token when landing on login page
    localStorage.removeItem('token')
  }, [])

  const login = async () => {
    try {
      setMsg('')

      const res = await fetch('http://localhost:2294/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return setMsg(data.message || 'Login failed')
      }

      // Save JWT token
      localStorage.setItem('token', data.token)

      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = '/admin/adminDashboard'
      } else {
        window.location.href = '/userDashboard'
      }

    } catch (error) {
      console.error(error)
      setMsg('Something went wrong')
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Current Password
                </label>

                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-[#9b5de5]" />

                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </button>
                </div>
              </div>
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
