import { createClient } from '@/lib/supabase/server'
import { formatDateShort, formatTime } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import BookingStatusBadge from '@/components/shared/BookingStatusBadge'
import type { BookingStatus } from '@/types/app'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalToday },
    { count: pending },
    { count: confirmed },
    { count: completed },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', today),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('bookings')
      .select('*, service_types(*), users(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const cards = [
    { label: "Today's bookings", value: totalToday ?? 0, icon: '📅', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending', value: pending ?? 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Confirmed', value: confirmed ?? 0, icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Completed', value: completed ?? 0, icon: '🏆', color: 'bg-purple-50 text-purple-700' },
  ]

  const bedroomLabel: Record<string, string> = {
    studio: 'Studio', '1br': '1BR', '2br': '2BR', '3br': '3BR', '4br': '4BR',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.color}`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent bookings</h2>
          <a href="/admin/bookings" className="text-sm text-pink-600 hover:underline font-medium">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Service</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Date & Time</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Total</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map((b, i) => {
                const st = b.service_types as { property_type: string; bedroom_count: string } | null
                const user = b.users as { full_name: string } | null
                return (
                  <tr key={b.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-5 py-3 font-medium text-gray-900">{user?.full_name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {st ? `${st.property_type === 'condo' ? 'Condo' : 'House'} ${bedroomLabel[st.bedroom_count] ?? ''}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {formatDateShort(b.booking_date)} · {formatTime(b.booking_time)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{formatCurrency(b.total_price)}</td>
                    <td className="px-5 py-3">
                      <BookingStatusBadge status={b.status as BookingStatus} />
                    </td>
                  </tr>
                )
              })}
              {(!recentBookings || recentBookings.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">No bookings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
