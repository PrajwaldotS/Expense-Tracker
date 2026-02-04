'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { SidebarTrigger } from './ui/sidebar'
import { FiBell } from 'react-icons/fi'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { CgProfile } from "react-icons/cg";
import { Button } from "@/components/ui/button"
import ProfileDropdown from './ProfileDropDown'

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, setTheme } = useTheme()

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
      setName(data?.name || user.email?.split('@')[0] || 'User')
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 rounded-md hover:bg-muted transition" />
          <h1 className="hidden sm:block text-lg font-semibold tracking-tight text-foreground">
            Finance Dashboard
          </h1>
        </div>

        {/* CENTER (Desktop Title Highlight) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-sm font-medium text-muted-foreground">
            Expense Management System
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 ml-auto">
          
          <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? <Moon size={18}/> : <Sun size={18}/>}
    </Button>

          {/* User Info */}
          {isLoggedIn && name && (
            <div className="text-right leading-tight">
              <ProfileDropdown />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
