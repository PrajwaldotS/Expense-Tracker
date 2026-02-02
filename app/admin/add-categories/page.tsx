'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CategoriesPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // 🔒 Protect route (Admin only)
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') {
        router.push('/Dashboard')
      } else {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  // ➕ Add category
  const addCategory = async () => {
    setMsg('')
    if (!name.trim()) return setMsg('Enter category name')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMsg('Not logged in')

    const { error } = await supabase.from('categories').insert({
      name,
      created_by: user.id,
    })

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Category added successfully!')
      setName('')
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
   <ProtectedRoute>
       <div className="max-w-md mx-5 mt-20 bg-black/10 shadow-lg rounded-md  p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Add New Category
      </h2>

      <input
        className="w-full border bg-white rounded-md px-4 py-2 mb-4"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={addCategory}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Add Category
      </button>

      {msg && (
        <p className="mt-4 text-center text-sm text-gray-700">{msg}</p>
      )}
    </div>
    </ProtectedRoute>
  )
}
