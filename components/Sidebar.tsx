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
import { MdOutlineSpaceDashboard } from "react-icons/md";
import {
  FiUsers,
  FiFolder,
  FiMapPin,
  FiPlusCircle,
  FiBarChart2
} from 'react-icons/fi'
import { FaRupeeSign } from "react-icons/fa";



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
          <Link
      href={role === 'admin' ? '/admin/adminDashboard' : '/userDashboard'}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all
        ${pathname === (role === 'admin' ? '/admin/adminDashboard' : '/userDashboard')
          ? 'bg-brand/10 text-brand shadow-sm'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
    >
      <RiAdminFill className="text-xl text-brand shrink-0" />
      <span className="transition-all group-data-[state=collapsed]:hidden group-data-[state=expanded]:inline ">{role === 'admin' ? 'Admin Panel' : 'User Panel'}</span>
    </Link>
        </SidebarMenu>
        <Separator className="" />
      </SidebarHeader>

      <SidebarContent className="px-3 space-y-2">

        {role === 'admin' && (
          <Accordion type="single" collapsible className="w-full space-y-2">

            {/* USERS */}
          
              
            <AccordionItem value="users" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline  ${
                  isGroupActive(['/admin/addUser', '/admin/manageUsers'])
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
                <NavItem href="/admin/addUser" label="Add User" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manageUsers" label="Manage Users" icon={FiUsers} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* CATEGORIES */}
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline  ${
                  isGroupActive(['/admin/addCategories', '/admin/manageCategories'])
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
                <NavItem href="/admin/addCategories" label="Add Category" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manageCategories" label="Manage Categories" icon={FiFolder} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* EXPENSES */}
            <AccordionItem value="expenses" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline  ${
                  isGroupActive(['/admin/addExpense', '/admin/manageExpenses'])
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
                <NavItem href="/admin/addExpenses" label="Add Expense" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manageExpenses" label="Manage Expenses" icon={FaRupeeSign} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* ZONES */}
            <AccordionItem value="zones" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/addZone', '/admin/manageZones'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <RiTimeZoneLine className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">Zones</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/addZone" label="Add Zone" icon={FiPlusCircle} pathname={pathname} />
                <NavItem href="/admin/manageZones" label="Manage Zones" icon={FiMapPin} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

            {/* REPORTS */}
            <AccordionItem value="reports" className="border-none">
              <AccordionTrigger
                className={`px-3 py-2  tracking-wider hover:no-underline ${
                  isGroupActive(['/admin/usersReport', '/admin/categoriesReport', '/admin/zoneReport'])
                    ? 'text-brand'
                    : 'text-muted-foreground'
                }`}
              >
                <FiBarChart2 className="inline mb-1 mr-2 text-brand rotate-0!" size={22} />
                <span className="flex-1 text-left text-base">Reports</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                <NavItem href="/admin/usersReport" label="User Report" icon={FiUsers} pathname={pathname} />
                <NavItem href="/admin/categoriesReport" label="Category Report" icon={FaRupeeSign} pathname={pathname} />
                <NavItem href="/admin/zoneReport" label="Zone Report" icon={FiMapPin} pathname={pathname} />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        )}

        {role === 'user' && (
          <SidebarGroup>
            <NavItem href="/userDashboard" label="Dashboard" icon={MdOutlineSpaceDashboard} pathname={pathname} />
            <NavItem href="/userExpenses" label="My Expenses" icon={FaRupeeSign} pathname={pathname} />

            <NavItem href="/admin/add-expense" label="Add Expense" icon={FiPlusCircle} pathname={pathname} />
          </SidebarGroup>
        )}

        

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
