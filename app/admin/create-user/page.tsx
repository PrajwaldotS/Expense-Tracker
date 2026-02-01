'use client'
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Create New User</h2>

      <input
        className="border w-full p-2 mb-2"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border w-full p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border w-full p-2 mb-4"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={createUser}
        className="bg-purple-600 text-white w-full py-2 rounded"
      >
        Create User
      </button>

      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
  )
}
