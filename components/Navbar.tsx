'use client'

import { useEffect, useState } from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import ProfileDropdown from './ProfileDropDown'

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          localStorage.removeItem('token')
          setIsLoggedIn(false)
          setLoading(false)
          return
        }

        const data = await res.json()

        setRole(data.role)
        setName(data.name || data.email?.split('@')[0] || 'User')
        setIsLoggedIn(true)
      } catch (error) {
        console.error(error)
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 rounded-md hover:bg-muted transition" />
        </div>

        {/* CENTER */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-xl font-bold text-foreground">
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
