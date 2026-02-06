import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
)

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    /* ------------------------------- */
    /* CREATE AUTH USER */
    /* ------------------------------- */
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'User creation failed' },
        { status: 400 }
      )
    }

    const userId = data.user.id

    /* ------------------------------- */
    /* INSERT INTO public.users */
    /* ------------------------------- */
    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: userId,
      name,
      email,          // ✅ IMPORTANT
      role: 'user',
    })

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 400 }
      )
    }

    /* ------------------------------- */
    /* RETURN USER ID */
    /* ------------------------------- */
    return NextResponse.json({
      success: true,
      userId,          // ✅ REQUIRED for uploads
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
