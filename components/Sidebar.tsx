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
  SidebarMenu,
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
import { FaUser } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { BiSolidCategory } from "react-icons/bi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { RiTimeZoneLine } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";
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

      <SidebarHeader className="px-3 pt-6 lg:mt-14">
        <SidebarMenu>
          <SidebarMenuButton className="text-sidebar-foreground text-base font-semibold">
            <RiAdminFill className="text-2xl text-brand shrink-0" />
            <span>{role === 'admin' ? 'Admin Panel' : 'User Panel'}</span>
          </SidebarMenuButton>
        </SidebarMenu>
        <Separator className="mt-3" />
      </SidebarHeader>

      <SidebarContent className="px-3 space-y-2">

        {role === 'admin' && (
          <Accordion type="single" collapsible className="w-full space-y-2">

            {/* USERS */}
            <AccordionItem value="users" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline flex  items-center  w-full ${
                  isGroupActive(['/admin/add-user', '/admin/manage-users'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <FaUser className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">
                  User
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-user" label="Add User" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-users" label="Manage Users" icon={FiUsers} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* CATEGORIES */}
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline flex items-start w-full ${
                  isGroupActive(['/admin/add-categories', '/admin/manage-categories'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <BiSolidCategory className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
               <span className="flex-1 text-left text-base">
                  Categories
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-categories" label="Add Category" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-categories" label="Manage Categories" icon={FiFolder} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* EXPENSES */}
            <AccordionItem value="expenses" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline flex items-start w-full ${
                  isGroupActive(['/admin/add-expense', '/admin/manage-expenses'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <FaMoneyBillTrendUp className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">
                  Expenses
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-expense" label="Add Expense" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-expenses" label="Manage Expenses" icon={FiDollarSign} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* ZONES */}
            <AccordionItem value="zones" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/add-zone', '/admin/manage-zones'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <RiTimeZoneLine className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">Zones</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/add-zone" label="Add Zone" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manage-zones" label="Manage Zones" icon={FiMapPin} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* REPORTS */}
            <AccordionItem value="reports" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/users', '/admin/categories', '/admin/zone'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <FiBarChart2 className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">Reports</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/users" label="User Report" icon={FiUsers} pathname={pathname} />
                <NavItem href="/admin/categories" label="Expense Report" icon={FiDollarSign} pathname={pathname} />
                <NavItem href="/admin/zone" label="Zone Report" icon={FiMapPin} pathname={pathname} />
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
        <Accordion type="single" collapsible className="border-none">
          <AccordionItem value="account" className="border-none">
            <AccordionTrigger
              className={`px-4 py-2  tracking-wider hover:no-underline ${
                pathname.startsWith('/change-password')
                  ? 'text-brand'
                  : 'text-muted-foreground'
              }`}
            >
              <MdAccountCircle className="mr-2 text-brand shrink-0 rotate-0!" size={22} />
              <span className="flex-1 text-left text-base">Account</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-1 pt-1">
              <NavItem
                href="/change-password"
                label="Change Password"
                icon={FiLock}
                pathname={pathname}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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
