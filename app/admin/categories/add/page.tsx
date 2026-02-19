"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiTag } from 'react-icons/fi'
import FormResetButton from '@/components/Resetbutton'
import { useToast } from '@/components/toast-1'

export default function CategoriesPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
    const { showToast } = useToast()

  useEffect(() => {

    Toast()
    checkAdmin()
  }, [router, msg])
    
  const Toast = ()=>{
    if (!msg) return null
    const type = msg.toLowerCase().includes('success')
    ? 'success'
    : 'error'

  showToast(msg, type, 'bottom-right')
  }

   const checkAdmin = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()

        if (data.role !== 'admin') {
          router.push('/Dashboard')
        } else {
          setLoading(false)
        }

      } catch (error) {
        console.error(error)
        router.push('/login')
      }
    }

  const addCategory = async () => {
    setMsg('')

    if (!name.trim()) {
      return setMsg('Enter category name')
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return setMsg('Not logged in')
    }

    try {
      const res = await fetch('http://localhost:2294/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.message || 'Error adding category')
        return
      }

      setMsg('Category added successfully!')
      setName('')

    } catch (error) {
      console.error(error)
      setMsg('Something went wrong')
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <ProtectedRoute>
      <div className="min-h-[70vh] px-4 mt-20">
        <div className="w-full max-w-lg bg-card border shadow-sm rounded-xl p-6 space-y-6">

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Add New Category
            </h2>
            <p className="text-sm text-muted-foreground">
              Create a category to organize expense tracking
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Category Name
            </label>
            <div className="relative">
              <FiTag className="absolute left-3 top-3 text-[#9b5de5]" />
              <input
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9b5de5] outline-none"
                placeholder="e.g. Office Supplies"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={addCategory}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition shadow-sm">
            Add Category
          </button>

          <FormResetButton onReset={() => setName('')} />

          

        </div>
      </div>
    </ProtectedRoute>
  )
}
