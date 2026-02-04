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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

import {
  FiUsers,
  FiFolder,
  FiDollarSign,
  FiMapPin,
  FiLock,
  FiPlusCircle,
  FiBarChart2
} from 'react-icons/fi'

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

  const isGroupActive = (paths: string[]) => {
    return paths.some((path) => pathname.startsWith(path))
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">

      <SidebarHeader className="px-5 pt-6 lg:mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-sidebar-foreground">
          {role === 'admin' ? 'Admin Panel' : 'User Panel'}
        </h2>
        <p className="text-xs text-muted-foreground">Finance Management</p>
        <Separator />
      </SidebarHeader>

      <SidebarContent className="px-3 space-y-2">

        {role === 'admin' && (
          <Accordion type="single" collapsible className="w-full space-y-2">

            {/* USERS */}
            <AccordionItem value="users" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2 text-xs uppercase tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/add-user', '/admin/manage-users', '/admin/users'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                User Management
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-user" label="Add User" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-users" label="Manage Users" icon={FiUsers} pathname={pathname} />
                <NavItem href="/admin/users" label="Expense Report" icon={FiBarChart2} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* CATEGORIES */}
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2 text-xs uppercase tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/add-categories', '/admin/manage-categories', '/admin/categories'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                Categories
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-categories" label="Add Category" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-categories" label="Manage Categories" icon={FiFolder} pathname={pathname} />
                <NavItem href="/admin/categories" label="Category Report" icon={FiBarChart2} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* EXPENSES */}
            <AccordionItem value="expenses" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2 text-xs uppercase tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/add-expense', '/admin/manage-expenses'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                Expenses
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-expense" label="Add Expense" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-expenses" label="Manage Expenses" icon={FiDollarSign} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* ZONES */}
            <AccordionItem value="zones" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2 text-xs uppercase tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/add-zone', '/admin/manage-zones', '/admin/zone'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                Zones
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-zone" label="Add Zone" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-zones" label="Manage Zones" icon={FiMapPin} pathname={pathname} />
                <NavItem href="/admin/zone" label="Zone Report" icon={FiBarChart2} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        )}

        {role === 'user' && (
          <SidebarGroup>
            <NavItem href="/Dashboard" label="My Expenses" icon={FiDollarSign} pathname={pathname} />
            <NavItem href="/admin/add-expense" label="Add Expense" icon={FiPlusCircle} pathname={pathname} />
          </SidebarGroup>
        )}

        {/* ACCOUNT */}
        <SidebarGroup>
          <SidebarMenuButton className="text-xs uppercase tracking-wider text-muted-foreground">
            Account
          </SidebarMenuButton>
          <NavItem href="/change-password" label="Change Password" icon={FiLock} pathname={pathname} />
        </SidebarGroup>

      </SidebarContent>

      

    </Sidebar>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string
  label: string
  icon: any
  pathname: string
}) {
  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
        ${isActive
          ? 'bg-brand/10 text-brand shadow-sm'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
    >
      <Icon className="text-base" />
      {label}
    </Link>
  )
}
