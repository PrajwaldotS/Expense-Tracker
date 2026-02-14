'use client'
import { useEffect, useState } from 'react'
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

      const token = localStorage.getItem('token')
      if (!token) {
        setZones([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch('http://localhost:2294/api/zones', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          setZones([])
          setLoading(false)
          return
        }

        const data = await res.json()
        setZones(data || [])

        if (data?.length === 1) {
          onChange(data[0].id)
        }

      } catch (error) {
        console.error(error)
        setZones([])
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
