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
import { usePathname } from 'next/navigation'

export function AppSidebar() {
  const pathname = usePathname()
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
      
      {/* HEADER */}
      <SidebarHeader className="mt-18">
        <h2 className="text-lg font-bold">
          {role === 'admin' ? 'Admin Panel' : 'User Panel'}
        </h2>
        <Separator />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>

        {role === 'admin' && (
          <>
            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Add Section</SidebarMenuButton>
              <NavItem href="/admin/add-expense" label="Add Expenses" pathname={pathname} />
              <NavItem href="/admin/add-categories" label="Add Categories" pathname={pathname} />
              <NavItem href="/admin/add-user" label="Add Users" pathname={pathname} />
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Management</SidebarMenuButton>
              <NavItem href="/admin/manage-expenses" label="Manage Expenses" pathname={pathname} />
              <NavItem href="/admin/manage-users" label="Manage Users" pathname={pathname} />
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenuButton className="font-semibold">Reports</SidebarMenuButton>
              <NavItem href="/admin/users" label="User Based Expenses" pathname={pathname} />
              <NavItem href="/admin/categories" label="Categories Based Expenses" pathname={pathname} />
            </SidebarGroup>
          </>
        )}

        {role === 'user' && (
          <SidebarGroup>
            <NavItem href="/Dashboard" label="My Expenses" pathname={pathname} />
            <NavItem href="/admin/add-expense" label="Add Expenses" pathname={pathname} />
          </SidebarGroup>
        )}

        <SidebarGroup>
          <NavItem href="/change-password" label="Change Password" pathname={pathname} />
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4 text-center text-muted-foreground">
        Logged in as {role}
        {isLoggedIn && <Logout />}
      </SidebarFooter>
    </Sidebar>
  )
}


/* 🔹 Active Link Component */
function NavItem({
  href,
  label,
  pathname,
}: {
  href: string
  label: string
  pathname: string
}) {
  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-md transition-all
        ${isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'hover:bg-muted text-muted-foreground'
        }`}
    >
      {label}
    </Link>
  )
}
