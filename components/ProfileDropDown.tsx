'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CgProfile } from 'react-icons/cg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logout from '@/components/Logout'
import { Separator } from './ui/separator'

export default function ProfileDropdown() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single()

      setName(data?.name || user.email?.split('@')[0] || 'User')
      setRole(data?.role || 'user')
    }

    loadUser()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-right leading-tight cursor-pointer">
          <CgProfile size={32} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
            <h1 className="text-center text-lg mb-2">Welcome , {name}</h1>
            <Separator/>
          
          <span className=" text-muted-foreground font-bold text-center capitalize">{role}</span>
        </DropdownMenuLabel>

        

        <DropdownMenuItem asChild >
          <Logout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
