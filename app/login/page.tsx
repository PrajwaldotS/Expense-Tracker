'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const signup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setMsg(error.message)

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: email.split('@')[0],
        role: 'user',
      })
    }
    setMsg('Signup success. Now login.')
  }

const login = async () => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return setMsg(error.message)

  // Get logged in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch role
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (data?.role === 'admin') {
    window.location.href = '/admin'
  } else {
    window.location.href = '/Dashboard'
  }
}


  return (
    <div>
      <h2>Login / Signup</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signup}>Sign Up</button>
      <button onClick={login}>Login</button>
      <p>{msg}</p>
    </div>
  )
}
