import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AdminUpdateUser = {
  user_metadata?: { name?: string }
  banned_until?: string | null
}

export async function POST(req: Request) {
  try {
    const { userId, name, role, disabled } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // 🔒 Prepare ban/unban date
    const banDate = disabled
      ? new Date('2100-01-01').toISOString()
      : null

    // 🔐 Update Supabase Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { name },
        banned_until: banDate,
      } as AdminUpdateUser //  Fixes TS error
    )

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 🗂 Update role in public.users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
