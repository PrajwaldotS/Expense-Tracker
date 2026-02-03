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
  const { data: authUsers, error: authError } =
    await supabaseAdmin.auth.admin.listUsers()

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Get roles
  const { data: roles } = await supabaseAdmin
    .from('users')
    .select('id, role')

  const roleMap = Object.fromEntries((roles || []).map(r => [r.id, r.role]))

  // Get zones assigned to users
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

  const users = authUsers.users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    banned_until: u.banned_until,
    user_metadata: u.user_metadata,
    role: roleMap[u.id] || 'user',
    zone_names: zoneMap[u.id]?.join(', ') || '', // 🔥 THIS FIXES YOUR UI
  }))

  return NextResponse.json(users)
}
