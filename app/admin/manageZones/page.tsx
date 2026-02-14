'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiSearch } from 'react-icons/fi'
import ZoneReportsShimmer from '@/components/skeletons/manageZonesSkeleton'

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchZones = async () => {
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(
        `http://localhost:2294/api/zones?page=${page}&pageSize=${pageSize}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setZones([])
        setTotalPages(1)
        setLoading(false)
        return
      }

      // If backend returns array directly
      if (Array.isArray(data)) {
        setZones(data)
        setTotalPages(1)
      }
      
      else {
        setZones(data.data || [])
        setTotalPages(data.totalPages || 1)
      }

    } catch (error) {
      console.error('FETCH ZONES ERROR:', error)
      setZones([])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchZones()
  }, [page, pageSize, search])

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return

    const token = localStorage.getItem('token')

    await fetch(`http://localhost:2294/api/zones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    fetchZones()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <ZoneReportsShimmer />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto mt-20 px-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Zones</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all operational zones
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search zones..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 focus-visible:ring-[#00bbf9]"
          />
        </div>

        {/* TABLE */}
        <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No zones found
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id} className="hover:bg-muted/40 transition">
                    <TableCell className="font-medium text-cyan-400">
                      {zone.name}
                    </TableCell>
                    <TableCell>
                      {zone.creator.name || '—'}
                    </TableCell>
                    <TableCell>
                      {zone.createdAt
                        ? new Date(zone.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteZone(zone.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00f5d4] outline-none"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

      </div>
    </ProtectedRoute>
  )
}
