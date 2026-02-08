'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiMapPin } from 'react-icons/fi'

export default function AddZonePage() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const addZone = async () => {
    setMsg('')
    if (!name.trim()) return setMsg('Zone name required')

    const { error } = await supabase.from('zones').insert({ name })
    if (error) return setMsg(error.message)

    setMsg('Zone added successfully!')
    setName('')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-[70vh]  px-4 mt-20">
        <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

          {/* HEADER */}
          <div>
            <h1 className="text-xl font-semibold text-foreground">Add New Zone</h1>
            <p className="text-sm text-muted-foreground">
              Create a new operational zone for expense tracking
            </p>
          </div>

          {/* INPUT */}
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

          {/* BUTTON */}
          <button
            onClick={addZone}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
          >
            Add Zone
          </button>

          {/* MESSAGE */}
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
