import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { userId, name, role, disabled } = await req.json()

  // Update auth metadata + disable/enable
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { name },
    banned_until: disabled ? '2100-01-01' : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Update public.users role
  await supabaseAdmin.from('users').update({ role }).eq('id', userId)

  return NextResponse.json({ message: 'User updated' })
}
