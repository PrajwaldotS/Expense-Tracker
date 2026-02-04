'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { FiTag } from 'react-icons/fi'

type Category = {
  id: string
  name: string
}

type CategorySelectProps = {
  value: string
  onChange: (value: string) => void
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')

      if (!error && data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="relative">
      <FiTag className="absolute left-3 top-3 text-[#9b5de5]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border rounded-lg bg-card focus:ring-2 focus:ring-[#9b5de5] outline-none text-sm"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option className='bg-card text-foreground' key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
