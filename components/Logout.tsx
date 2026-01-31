'use client'

import { supabase } from '@/lib/supabaseClient'

export default function Logout() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return <button onClick={logout} className='mr-4 text-black bg-white border p-2 shadow-lg rounded-xl'>Logout</button>
}
// A simple logout button component that signs the user out and redirects to the login page