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
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from 'next/link'
import { Separator } from './ui/separator'

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

  if (!isLoggedIn) return null

  return (
    <Sidebar collapsible="icon">
      {role === 'admin' && (
        <SidebarHeader className="mt-18">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <Separator className="" />
        </SidebarHeader>
      )}
      {role === 'user' && (
        <SidebarHeader className="mt-18">
          <h2 className="text-lg font-bold">User Panel</h2>
          <Separator className="" />
        </SidebarHeader>
      )}

      <SidebarContent>

        {role === 'admin' && (
          <>
            {/* ➕ ADD SECTION */}
            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Add Section</SidebarMenuButton>
              <Link href="/admin/add-expense" className="block px-4 py-2 hover:bg-muted active:bg-muted rounded-md">
                Add Expenses
              </Link>
              <Link href="/admin/add-categories" className="block px-4 py-2 hover:bg-muted rounded-md">
                Add Categories
              </Link>
              <Link href="/admin/add-user" className="block px-4 py-2 hover:bg-muted rounded-md">
                Add Users
              </Link>
            </SidebarGroup>

            {/* ⚙️ MANAGEMENT SECTION */}
            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Management</SidebarMenuButton>
              <Link href="/admin/manage-expenses" className="block px-4 py-2 hover:bg-muted rounded-md">
                Manage Expenses
              </Link>
              <Link href="/admin/manage-users" className="block px-4 py-2 hover:bg-muted rounded-md">
                Manage Users
              </Link>
            </SidebarGroup>

            {/* 📊 REPORTS SECTION */}
            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Reports</SidebarMenuButton>
              <Link href="/admin/users" className="block px-4 py-2 hover:bg-muted rounded-md">
                User Based Expenses
              </Link>
              <Link href="/admin/categories" className="block px-4 py-2 hover:bg-muted rounded-md">
                Categories Based Expenses
              </Link>
            </SidebarGroup>
          </>
        )}

        {role === 'user' && (
          <SidebarGroup>
            <Link href="/Dashboard" className="block px-4 py-2 hover:bg-muted rounded-md">
              My Expenses
            </Link>
            <Link href="/admin/add-expense" className="block px-4 py-2 hover:bg-muted rounded-md">
              Add Expenses
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
