'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AddZonePage() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const addZone = async () => {
    if (!name) return setMsg('Zone name required')

    const { error } = await supabase.from('zones').insert({ name })
    if (error) return setMsg(error.message)

    setMsg('Zone added!')
    setName('')
  }

  return (
    <ProtectedRoute >
      <div className="p-8 max-w-md mx-5 bg-black/10 rounded-xl mt-20">
        <h1 className="text-2xl font-bold mb-4">Add Zone</h1>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Zone Name"
          className="border p-2 rounded w-full mb-3 bg-white "
        />
        <button onClick={addZone} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Zone
        </button>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>
    </ProtectedRoute>
  )
}
