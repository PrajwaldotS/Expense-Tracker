'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { FiMapPin } from 'react-icons/fi'

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

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'admin') {
        const { data } = await supabase
          .from('zones')
          .select('id, name')
          .order('name')

        setZones(data || [])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_zones')
        .select('zones(id, name)')
        .eq('user_id', user.id)

      const assignedZones: Zone[] =
        data?.map((z: any) => z.zones).filter(Boolean) || []

      setZones(assignedZones)

      if (assignedZones.length === 1) {
        onChange(assignedZones[0].id)
      }

      setLoading(false)
    }

    loadZones()
  }, [onChange])

  return (
    <div className="space-y-1">
      <div className="relative">
        <FiMapPin className="absolute left-3 top-3 text-[#00bbf9]" />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={loading || zones.length === 0}
          className="w-full pl-10 pr-3 py-2 border rounded-lg bg-card focus:ring-2 focus:ring-[#00bbf9] outline-none text-sm disabled:opacity-60"
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
      </div>

      {!loading && zones.length === 0 && (
        <p className="text-xs text-[#f15bb5] font-medium">
          No zones assigned to you
        </p>
      )}
    </div>
  )
}
