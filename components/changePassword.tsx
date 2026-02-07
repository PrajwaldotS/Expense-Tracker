'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { FiLock } from 'react-icons/fi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
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

    // 🔐 Verify current password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (loginError) {
      setMsg('Current password is incorrect')
      setLoading(false)
      return
    }

    // 🔄 Update password
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

    // Auto-close dialog
    setTimeout(() => {
      setOpen(false)
      setMsg('')
    }, 1200)
  }

  return (
    <>
      {/* 🔘 Trigger Button */}
      <div className="flex items-center justify-center">
        <Button className='bg-card text-foreground border shadow rounded-lg hover:bg-card/80 cursor-pointer' onClick={() => setOpen(true)}>
        Change Password
      </Button>
      </div>

      {/* 🪟 Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* Current Password */}
            <div className="space-y-1">
              <Label>Current Password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-[#9b5de5]" />
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <Label>New Password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-[#f15bb5]" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Message */}
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

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-[#00bbf9] hover:bg-[#009edc]"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
