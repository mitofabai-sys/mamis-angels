'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateShort, formatTime } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Cleaner, BookingStatus } from '@/types/app'

interface Booking {
  id: string
  booking_date: string
  booking_time: string
  address: string
  status: string
  total_price: number
  cleaner_id: string | null
  notes: string | null
  users: { full_name: string } | null
  service_types: { property_type: string; bedroom_count: string } | null
}

interface Props {
  bookings: Booking[]
  cleaners: Cleaner[]
}

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const bedroomLabel: Record<string, string> = {
  studio: 'Studio', '1br': '1BR', '2br': '2BR', '3br': '3BR', '4br': '4BR',
}

export default function BookingsTable({ bookings, cleaners }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateBooking(id: string, payload: { status?: string; cleaner_id?: string | null }) {
    setUpdating(id)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setUpdating(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Service</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Date &amp; Time</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Address</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cleaner</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {b.users?.full_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {b.service_types
                    ? `${b.service_types.property_type === 'condo' ? 'Condo' : 'House'} ${bedroomLabel[b.service_types.bedroom_count] ?? ''}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDateShort(b.booking_date)}<br />
                  <span className="text-xs text-gray-400">{formatTime(b.booking_time)}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={b.address}>
                  {b.address}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                  {formatCurrency(b.total_price)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.cleaner_id ?? ''}
                    onChange={(e) => updateBooking(b.id, { cleaner_id: e.target.value || null })}
                    disabled={updating === b.id || isPending}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {cleaners.filter((c) => c.is_active).map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => updateBooking(b.id, { status: e.target.value })}
                    disabled={updating === b.id || isPending}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
