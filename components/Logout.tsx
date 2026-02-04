'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Logout() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className='flex justify-center items-center'>
      <button onClick={logout} className=' text-black bg-white border  px-4 py-1 shadow-lg rounded-xl'>Logout</button>
    </div>
  )
}
// A simple logout button component that signs the user out and redirects to the login page