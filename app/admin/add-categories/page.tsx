import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import { FiTag } from 'react-icons/fi'
import FormResetButton from '@/components/Resetbutton'

export default function CategoriesPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-[70vh]  px-4 mt-20">
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
