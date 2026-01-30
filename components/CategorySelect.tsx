'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase.from('categories').select('id,name').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select Category</option>
      {categories.map((c: any) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
