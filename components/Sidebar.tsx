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
      <SidebarHeader className="lg:mt-18">
        <h2 className="text-lg font-bold text-center">
          {role === 'admin' ? 'Admin Panel' : 'User Panel'}
        </h2>
        <Separator />
      </SidebarHeader>

      <SidebarContent>

        {role === 'admin' && (
          <>

            {/* 👤 USER MANAGEMENT */}
            <SidebarGroup>
              <SidebarMenuButton className="font-bold text-xl">Users</SidebarMenuButton>
              <NavItem href="/admin/add-user" label="Add User" pathname={pathname} />
              <NavItem href="/admin/manage-users" label="Manage Users" pathname={pathname} />
              <NavItem href="/admin/users" label="User Expense Report" pathname={pathname} />
            </SidebarGroup>

            {/* 🗂 CATEGORY MANAGEMENT */}
            <SidebarGroup>
              <SidebarMenuButton className="font-bold text-xl">Categories</SidebarMenuButton>
              <NavItem href="/admin/add-categories" label="Add Category" pathname={pathname} />
              <NavItem href="/admin/manage-categories" label="Manage Categories" pathname={pathname} />
              <NavItem href="/admin/categories" label="Category Expense Report" pathname={pathname} />
            </SidebarGroup>

            {/* 💸 EXPENSE MANAGEMENT */}
            <SidebarGroup>
              <SidebarMenuButton className="font-bold text-xl">Expenses</SidebarMenuButton>
              <NavItem href="/admin/add-expense" label="Add Expense" pathname={pathname} />
              <NavItem href="/admin/manage-expenses" label="Manage Expenses" pathname={pathname} />
            </SidebarGroup>

            {/* 📍 ZONE MANAGEMENT */}
            <SidebarGroup>
              <SidebarMenuButton className="font-bold text-xl">Zones</SidebarMenuButton>
              <NavItem href="/admin/add-zone" label="Add Zone" pathname={pathname} />
              <NavItem href="/admin/manage-zones" label="Manage Zones" pathname={pathname} />
              <NavItem href="/admin/zone" label="Zone Summary Report" pathname={pathname} />
            </SidebarGroup>

          </>
        )}

        {role === 'user' && (
          <SidebarGroup>
            <NavItem href="/Dashboard" label="My Expenses" pathname={pathname} />
            <NavItem href="/admin/add-expense" label="Add Expense" pathname={pathname} />
          </SidebarGroup>
        )}

        {/* 🔑 ACCOUNT */}
        <SidebarGroup>
          <NavItem href="/change-password" label="Change Password" pathname={pathname} />
        </SidebarGroup>

      </SidebarContent>

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
