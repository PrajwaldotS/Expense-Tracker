'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function CategoriesPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  // 🔒 Protect route
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // Not logged in → go to login
      if (!user) {
        router.push('/login')
        return
      }

      // Check role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || data?.role !== 'admin') {
        router.push('/Dashboard') // Not admin → send away
      }
    }

    checkAdmin()
  }, [router])

  // ➕ Add category
  const addCategory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMsg('Not logged in')

    if (!name.trim()) return setMsg('Enter category name')

    const { error } = await supabase.from('categories').insert({
      name,
      created_by: user.id,
    })

    if (error) setMsg(error.message)
    else {
      setMsg('Category added!')
      setName('')
    }
  }

  return (
    <div>
      <h2>Admin — Manage Categories</h2>

      <input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addCategory}>Add Category</button>

      <p>{msg}</p>
    </div>
  )
}
