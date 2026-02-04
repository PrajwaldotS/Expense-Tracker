'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { FiLock } from 'react-icons/fi'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    setMsg('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setMsg('User not found')
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (loginError) {
      setMsg('Current password is incorrect')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setMsg(updateError.message)
      setLoading(false)
      return
    }

    setMsg('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setLoading(false)

    setTimeout(() => router.push('/Dashboard'), 1500)
  }

  return (
    <div className="min-h-[70vh]  px-4 mt-20">
      <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            Confirm your current password before setting a new one.
          </p>
        </div>

        <div className="space-y-4">

          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-[#9b5de5]" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-[#f15bb5]" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f15bb5] outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-[#00bbf9] hover:bg-[#009edc] text-white font-medium py-2.5 rounded-lg transition shadow-sm"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          {/* MESSAGE */}
          {msg && (
            <p className={`text-sm text-center ${
              msg.includes('success')
                ? 'text-[#00f5d4]'
                : 'text-[#f15bb5]'
            }`}>
              {msg}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
