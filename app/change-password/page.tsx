'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

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

    // 🔐 Step 1: Re-authenticate with current password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (loginError) {
      setMsg('Current password is incorrect')
      setLoading(false)
      return
    }

    // 🔄 Step 2: Update to new password
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
    <div className="min-h-screen bg-white px-6">
      <div className="max-w-md  mt-20 bg-black/10 shadow-xl rounded-2xl p-8 border border-gray-200">

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          For security, please confirm your current password.
        </p>

        <div className="space-y-5">

          <div>
            <label className="block  text-sm font-medium text-gray-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          {msg && (
            <p className={`text-center text-sm mt-2 ${
              msg.includes('success') ? 'text-green-600' : 'text-red-600'
            }`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
