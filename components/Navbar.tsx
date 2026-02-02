'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { SidebarTrigger } from './ui/sidebar'

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null) // ✅ store name
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const getRoleAndName = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', user.id)
        .single()

      setRole(data?.role || 'user')
      setName(data?.name || user.email?.split('@')[0] || 'User') // ✅ fallback
      setLoading(false)
    }

    getRoleAndName()
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) return null

  return (
    <nav className="fixed w-full h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
      
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2 rounded-md hover:bg-gray-200 transition" />
        <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
          Expense Tracker
        </h1>
      </div>

      <div className="flex items-center  gap-4">
        {isLoggedIn && name && (
          <span className="text-xl text-gray-700 font-medium">
            Welcome, {name} 
          </span>
        )}
      </div>

    </nav>
  )
}
