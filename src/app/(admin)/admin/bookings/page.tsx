import { createClient } from '@/lib/supabase/server'
import BookingsTable from '@/components/admin/BookingsTable'
import type { Cleaner } from '@/types/app'

interface SearchParams {
  status?: string
  date_from?: string
  date_to?: string
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  let query = supabase
    .from('bookings')
    .select('*, users(full_name), service_types(*)')
    .order('booking_date', { ascending: false })

  const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const
  type ValidStatus = typeof VALID_STATUSES[number]
  if (searchParams.status && (VALID_STATUSES as readonly string[]).includes(searchParams.status)) {
    query = query.eq('status', searchParams.status as ValidStatus)
  }
  if (searchParams.date_from) {
    query = query.gte('booking_date', searchParams.date_from)
  }
  if (searchParams.date_to) {
    query = query.lte('booking_date', searchParams.date_to)
  }

  const [{ data: bookings }, { data: cleaners }] = await Promise.all([
    query,
    supabase.from('cleaners').select('*').order('full_name'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All bookings</h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6 bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status ?? ''}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">From date</label>
          <input
            type="date"
            name="date_from"
            defaultValue={searchParams.date_from ?? ''}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">To date</label>
          <input
            type="date"
            name="date_to"
            defaultValue={searchParams.date_to ?? ''}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-colors"
          >
            Filter
          </button>
        </div>
        <div className="flex items-end">
          <a
            href="/admin/bookings"
            className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Clear
          </a>
        </div>
      </form>

      <BookingsTable
        bookings={(bookings ?? []) as Parameters<typeof BookingsTable>[0]['bookings']}
        cleaners={(cleaners ?? []) as Cleaner[]}
      />
    </div>
  )
}
