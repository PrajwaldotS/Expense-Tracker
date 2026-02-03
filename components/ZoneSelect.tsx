'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Zone = { id: string; name: string }

export default function ZoneSelect({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [zones, setZones] = useState<Zone[]>([])

  useEffect(() => {
    supabase.from('zones').select('id,name').then(({ data }) => {
      setZones(data || [])
    })
  }, [])

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border rounded px-2 py-1 w-full"
    >
      <option value="">Select Zone</option>
      {zones.map(z => (
        <option key={z.id} value={z.id}>{z.name}</option>
      ))}
    </select>
  )
}
