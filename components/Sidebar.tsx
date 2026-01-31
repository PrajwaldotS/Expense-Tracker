'use client'
import Logout from './Logout'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from 'next/link'

export function AppSidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        return
      }

      setIsLoggedIn(true)

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(data?.role || 'user')
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ❌ If not logged in, don't show sidebar
  if (!isLoggedIn) return null

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-2 text-lg font-semibold">
        Expense Tracker
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Link href="/Dashboard" className="block px-4 py-2 hover:bg-muted rounded-md">
            Dashboard
          </Link>

          <Link href="/add-expense" className="block px-4 py-2 hover:bg-muted rounded-md">
            Add Expense
          </Link>
        </SidebarGroup>

        {role === 'admin' && (
          <SidebarGroup>
            <Link href="/admin" className="block px-4 py-2 hover:bg-muted rounded-md">
              Admin Dashboard
            </Link>

            <Link href="/admin/categories" className="block px-4 py-2 hover:bg-muted rounded-md">
              Manage Categories
            </Link>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 text-xs text-muted-foreground">
        Logged in as {role}
        {isLoggedIn && <Logout />}
      </SidebarFooter>
    </Sidebar>
  )
}
