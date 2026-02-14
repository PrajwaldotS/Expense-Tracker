'use client'

import { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setCategories([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          setCategories([])
          setLoading(false)
          return
        }

        const data = await res.json()
        setCategories(data || [])

      } catch (error) {
        console.error(error)
        setCategories([])
      }

      setLoading(false)
    }

    fetchCategories()
  }, [])

  return (
    <div className="relative">
      <FiTag className="absolute left-3 top-3 text-[#9b5de5]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full pl-10 pr-3 py-2 border rounded-lg bg-card focus:ring-2 focus:ring-[#9b5de5] outline-none text-sm disabled:opacity-60"
      >
        <option value="">
          {loading ? 'Loading categories...' : 'Select Category'}
        </option>

        {categories.map((c) => (
          <option
            className='bg-card text-foreground'
            key={c.id}
            value={c.id}
          >
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
