'use client'
import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiMapPin } from 'react-icons/fi'

export default function AddZonePage() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const addZone = async () => {
    setMsg('')

    if (!name.trim()) {
      return setMsg('Zone name required')
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return setMsg('Not authorized')
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:2294/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.message || 'Error adding zone')
        setLoading(false)
        return
      }

      setMsg('Zone added successfully!')
      setName('')

    } catch (error) {
      console.error(error)
      setMsg('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-[70vh] px-4 mt-20">
        <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

          <div>
            <h1 className="text-xl font-semibold text-foreground">Add New Zone</h1>
            <p className="text-sm text-muted-foreground">
              Create a new operational zone for expense tracking
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Zone Name</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-[#00bbf9]" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. North Region"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00bbf9] outline-none"
              />
            </div>
          </div>

          <button
            onClick={addZone}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Adding Zone...' : 'Add Zone'}
          </button>

          {msg && (
            <p className={`text-sm text-center ${
              msg.includes('success')
                ? 'text-[#00f5d4]'
                : 'text-destructive'
            }`}>
              {msg}
            </p>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}
