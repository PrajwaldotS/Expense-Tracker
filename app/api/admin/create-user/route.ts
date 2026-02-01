import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server only
)

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  // Create auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Insert into public.users
  await supabaseAdmin.from('users').insert({
    id: data.user.id,
    name,
    role: 'user',
  })

  return NextResponse.json({ message: 'User created successfully' })
}
