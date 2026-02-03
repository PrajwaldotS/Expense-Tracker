'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Zone = {
  id: string
  name: string
}

export default function ZoneSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadZones = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setZones([])
        setLoading(false)
        return
      }

      // 🔹 Get role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // 🟣 ADMIN → All zones
      if (userData?.role === 'admin') {
        const { data } = await supabase
          .from('zones')
          .select('id, name')
          .order('name')

        setZones(data || [])
        setLoading(false)
        return
      }

      // 🔵 USER → Only assigned zones
      const { data } = await supabase
        .from('user_zones')
        .select('zones(id, name)')
        .eq('user_id', user.id)

      const assignedZones: Zone[] =
        data?.map((z: any) => z.zones).filter(Boolean) || []

      setZones(assignedZones)

      // Auto-select if only one zone
      if (assignedZones.length === 1) {
        onChange(assignedZones[0].id)
      }

      setLoading(false)
    }

    loadZones()
  }, [onChange])

  return (
    <div className="bg-white p-2 rounded-md">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading || zones.length === 0}
        className="w-full"
      >
        <option value="">
          {loading ? 'Loading zones...' : 'Select Zone'}
        </option>

        {zones.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      {!loading && zones.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          No zones assigned to you
        </p>
      )}
    </div>
  )
}
