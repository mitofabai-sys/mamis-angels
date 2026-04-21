import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateShort, formatTime } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import BookingStatusBadge from '@/components/shared/BookingStatusBadge'
import type { BookingStatus } from '@/types/app'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, service_types(*), booking_addons(*, addons(*))')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
        <a
          href="/book"
          className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-colors"
        >
          + New booking
        </a>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🧹</div>
          <p className="text-gray-500 font-medium">No bookings yet</p>
          <p className="text-sm text-gray-400 mt-1">Book your first cleaning and we&apos;ll take care of the rest.</p>
          <a
            href="/book"
            className="inline-block mt-4 px-5 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-colors"
          >
            Book now
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => {
            const st = booking.service_types as { property_type: string; bedroom_count: string } | null
            const bedroomLabel: Record<string, string> = {
              studio: 'Studio', '1br': '1BR', '2br': '2BR', '3br': '3BR', '4br': '4BR',
            }
            const serviceLabel = st
              ? `${st.property_type === 'condo' ? 'Condo' : 'House'} ${bedroomLabel[st.bedroom_count] ?? ''}`
              : 'Cleaning'

            const addons = (booking.booking_addons as { addons: { name: string } | null; quantity: number }[]) ?? []

            return (
              <details
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm group"
              >
                <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{serviceLabel}</span>
                      <BookingStatusBadge status={booking.status as BookingStatus} />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDateShort(booking.booking_date)} · {formatTime(booking.booking_time)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatCurrency(booking.total_price)}</p>
                    <p className="text-xs text-gray-400 group-open:hidden">Show details ▾</p>
                    <p className="text-xs text-gray-400 hidden group-open:block">Hide ▴</p>
                  </div>
                </summary>

                <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24 shrink-0">Address</span>
                    <span className="text-gray-900">{booking.address}</span>
                  </div>
                  {booking.notes && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Notes</span>
                      <span className="text-gray-900">{booking.notes}</span>
                    </div>
                  )}
                  {addons.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24 shrink-0">Add-ons</span>
                      <span className="text-gray-900">
                        {addons
                          .filter((a) => a.addons)
                          .map((a) => `${a.addons!.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}`)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24 shrink-0">Booked on</span>
                    <span className="text-gray-900">{formatDateShort(booking.created_at.split('T')[0])}</span>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
