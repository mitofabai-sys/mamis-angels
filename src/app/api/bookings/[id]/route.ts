import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { sendSms } from '@/lib/notifications/sms'
import { sendEmail } from '@/lib/notifications/email'
import { buildConfirmationSms, buildConfirmationEmail } from '@/lib/notifications/templates'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin check
  const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { status, cleaner_id } = body
  const bookingId = params.id

  const adminClient = createServiceRoleClient()

  // Fetch current booking
  const { data: currentBooking } = await adminClient
    .from('bookings')
    .select('*, users(full_name, phone), service_types(*)')
    .eq('id', bookingId)
    .single()

  if (!currentBooking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Build update payload with proper typing
  type BookingUpdate = {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    cleaner_id?: string | null
  }
  const updatePayload: BookingUpdate = {}
  if (status) updatePayload.status = status as BookingUpdate['status']
  if (cleaner_id !== undefined) updatePayload.cleaner_id = cleaner_id || null

  const { error } = await adminClient
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingId)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // If status changed to 'confirmed', check if confirmation was already sent
  if (status === 'confirmed') {
    const { data: existingNotif } = await adminClient
      .from('notifications')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('type', 'confirmation')
      .eq('status', 'sent')
      .limit(1)

    if (!existingNotif || existingNotif.length === 0) {
      // Fetch user email
      const { data: authUser } = await adminClient.auth.admin.getUserById(currentBooking.user_id)
      const userEmail = authUser?.user?.email

      const userData = {
        full_name: (currentBooking.users as { full_name: string })?.full_name ?? 'Customer',
        phone: (currentBooking.users as { phone: string | null })?.phone ?? null,
      }
      const bookingData = {
        booking_date: currentBooking.booking_date,
        booking_time: currentBooking.booking_time,
        address: currentBooking.address,
        total_price: currentBooking.total_price,
      }

      const bedroomLabel: Record<string, string> = {
        studio: 'Studio', '1br': '1 Bedroom', '2br': '2 Bedrooms',
        '3br': '3 Bedrooms', '4br': '4 Bedrooms',
      }
      const st = currentBooking.service_types as { property_type: string; bedroom_count: string }
      const serviceLabel = `${st.property_type === 'condo' ? 'Condo' : 'House'} — ${bedroomLabel[st.bedroom_count] ?? st.bedroom_count}`

      // Send SMS
      if (userData.phone) {
        try {
          const smsBody = buildConfirmationSms(bookingData, userData)
          const result = await sendSms({ to: userData.phone, body: smsBody })
          await adminClient.from('notifications').insert({
            booking_id: bookingId,
            type: 'confirmation',
            channel: 'sms',
            status: result.success ? 'sent' : 'failed',
          })
        } catch (err) {
          console.error('[SMS error on confirm]', err)
        }
      }

      // Send email
      if (userEmail) {
        try {
          const html = buildConfirmationEmail(bookingData, userData, serviceLabel, [])
          const result = await sendEmail({
            to: userEmail,
            subject: "Your Mami's Angels booking is confirmed",
            html,
          })
          await adminClient.from('notifications').insert({
            booking_id: bookingId,
            type: 'confirmation',
            channel: 'email',
            status: result.success ? 'sent' : 'failed',
          })
        } catch (err) {
          console.error('[Email error on confirm]', err)
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}
