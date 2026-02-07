'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CgProfile } from 'react-icons/cg'
import { usePathname } from 'next/navigation'

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
import ChangePasswordDialog from './changePassword'

export default function ProfileDropdown() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('name, role,profile_photo_url')
        .eq('id', user.id)
        .single()

      setName(data?.name || user.email?.split('@')[0] || 'User')
      setRole(data?.role || 'user')
      setProfilePhoto(data?.profile_photo_url || null)
    }

    loadUser()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-right leading-tight cursor-pointer">
          {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                onError={(e) => {
                  e.currentTarget.src = '/avatar-placeholder.png'
                }}
              />
            ) : (
              <CgProfile size={32} />
            )}

        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col items-center gap-2">

          {/* Profile Photo (Square in Dropdown) */}
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-20 h-20 rounded-lg object-cover border"
              onError={(e) => {
                e.currentTarget.src = '/avatar-placeholder.png'
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-lg border flex items-center justify-center">
              <CgProfile size={36} />
            </div>
          )}
        
          <h1 className="text-center text-lg">
            Welcome, {name}
          </h1>
        
          <Separator />
        
          <span className="text-muted-foreground text-sm font-semibold capitalize">
            {role}
          </span>
        
        </DropdownMenuLabel>
        
         
          <DropdownMenuItem asChild >
          <ChangePasswordDialog/> 
        </DropdownMenuItem>
        <DropdownMenuItem asChild >
          <Logout />
        </DropdownMenuItem>
         
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
