import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ZoneLinkRow = {
  user_id: string
  zones: { name: string } | null
}

export async function GET() {
  // 1️⃣ Get auth users
  const { data: authUsers, error: authError } =
    await supabaseAdmin.auth.admin.listUsers()

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // 2️⃣ Get extended user data from public.users
  const { data: publicUsers } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      role,
      dob,
      id_proof_type,
      id_proof_url,
      profile_photo_url
    `)

  const publicUserMap = Object.fromEntries(
    (publicUsers || []).map(u => [u.id, u])
  )

  // 3️⃣ Get zones
  const { data: zoneLinks } = await supabaseAdmin
    .from('user_zones')
    .select('user_id, zones(name)')
    .returns<ZoneLinkRow[]>()

  const zoneMap: Record<string, string[]> = {}

  zoneLinks?.forEach(link => {
    if (!link.zones) return
    if (!zoneMap[link.user_id]) zoneMap[link.user_id] = []
    zoneMap[link.user_id].push(link.zones.name)
  })

  // 4️⃣ Merge everything
  const users = authUsers.users.map(u => {
    const extra = publicUserMap[u.id] || {}

    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      banned_until: u.banned_until,
      user_metadata: u.user_metadata,

      // ✅ NOW THESE EXIST
      dob: extra.dob ?? null,
      id_proof_type: extra.id_proof_type ?? null,
      id_proof_url: extra.id_proof_url ?? null,
      profile_photo_url: extra.profile_photo_url ?? null,

      role: extra.role || 'user',
      zone_names: zoneMap[u.id]?.join(', ') || '',
    }
  })

  return NextResponse.json(users)
}
