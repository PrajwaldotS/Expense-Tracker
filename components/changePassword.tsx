'use client'

import { useState } from 'react'
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

    const token = localStorage.getItem('token')

    if (!token) {
      setMsg('Not authenticated')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('http://localhost:2294/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.message || 'Error updating password')
        setLoading(false)
        return
      }

      setMsg('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setLoading(false)

      setTimeout(() => {
        setOpen(false)
        setMsg('')
      }, 1200)

    } catch (error) {
      console.error(error)
      setMsg('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <Button
          className='bg-card text-foreground border shadow rounded-lg hover:bg-card/80 cursor-pointer'
          onClick={() => setOpen(true)}
        >
          Change Password
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

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
