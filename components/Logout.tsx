'use client'

import { supabase } from '@/lib/supabaseClient'

export default function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return <button onClick={logout}>Logout</button>
}
// A simple logout button component that signs the user out and redirects to the login page