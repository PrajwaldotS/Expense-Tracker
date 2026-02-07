'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Logout() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className='flex   justify-center items-center my-2'>
      <button onClick={logout} className=' bg-card cursor-pointer text-foreground border shadow  px-4 py-1  rounded-lg'>Logout</button>
    </div>
  )
}
// A simple logout button component that signs the user out and redirects to the login page