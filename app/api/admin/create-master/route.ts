import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  // 1️⃣ Create auth user (OFFICIAL WAY)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'master@gmail.com',
    password: 'master@123',
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message }, { status: 400 })
  }

  const userId = data.user.id

  // 2️⃣ Insert/update public.users
  await supabaseAdmin.from('users').upsert({
    id: userId,
    name: 'Master Admin',
    email: 'master@gmail.com',
    role: 'admin',
  })

  return NextResponse.json({ success: true })
}
