import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()

  const {
    userId,
    name,
    email,
    dob,
    id_proof_type,
    profile_photo_url,
    role,
  } = body

  // 1️⃣ Update public.users (bypasses RLS)
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .update({
      name,
      email,
      dob,
      id_proof_type,
      profile_photo_url,
      role,
    })
    .eq('id', userId)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  // 2️⃣ Update auth email if provided
  if (email) {
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, { email })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
}
