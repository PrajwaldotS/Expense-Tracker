'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UserZoneSelect({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => {
    const fetchZones = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_zones')
        .select('zone_id, zones(name)')
        .eq('user_id', user.id)

      setZones(data || [])

      if (data?.length === 1) {
        onChange(data[0].zone_id) // auto-select if only 1
      }
    }

    fetchZones()
  }, [])

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border rounded px-2 py-1 w-full"
    >
      <option value="">Select Zone</option>
      {zones.map(z => (
        <option key={z.zone_id} value={z.zone_id}>
          {z.zones.name}
        </option>
      ))}
    </select>
  )
}
