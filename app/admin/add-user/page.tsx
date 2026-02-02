'use client'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState } from 'react'

export default function CreateUserPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const createUser = async () => {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json()
    if (data.error) setMsg(data.error)
    else setMsg('User created successfully!')
  }

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-5 mt-20 p-6 bg-black/10 shadow-lg rounded-md">
      <h2 className="text-3xl font-bold mb-4 text-center">Create New User</h2>

      <input
        className="border w-full p-2 mb-2 bg-white rounded-md"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border w-full p-2 mb-2 bg-white rounded-md"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border w-full p-2 mb-4 bg-white rounded-md"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={createUser}
        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
      >
        Create User
      </button>

      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
    </ProtectedRoute>
  )
}
