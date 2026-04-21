import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { sendSms } from '@/lib/notifications/sms'
import { sendEmail } from '@/lib/notifications/email'
import { buildConfirmationSms, buildConfirmationEmail } from '@/lib/notifications/templates'
import type { AddonSelection } from '@/types/app'

export async function POST(request: NextRequest) {
  // 1. Validate session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  const body = await request.json()
  const {
    serviceTypeId,
    addonSelections,
    bookingDate,
    bookingTime,
    availabilityId,
    address,
    notes,
  } = body as {
    serviceTypeId: string
    addonSelections: AddonSelection[]
    bookingDate: string
    bookingTime: string
    availabilityId: string
    address: string
    notes: string
  }

  if (!serviceTypeId || !bookingDate || !bookingTime || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // 3. Recompute total server-side (never trust client price)
  const { data: serviceType } = await admin
    .from('service_types')
    .select('*')
    .eq('id', serviceTypeId)
    .single()

  if (!serviceType) {
    return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
  }

  let addonTotal = 0
  let addonRows: { addon_id: string; quantity: number }[] = []

  if (addonSelections?.length > 0) {
    const { data: addonData } = await admin
      .from('addons')
      .select('id, price, has_quantity')
      .in('id', addonSelections.map((a) => a.addonId))

    if (addonData) {
      addonRows = addonSelections
        .filter((sel) => addonData.some((a) => a.id === sel.addonId))
        .map((sel) => {
          const addon = addonData.find((a) => a.id === sel.addonId)!
          const qty = addon.has_quantity ? Math.max(1, sel.quantity) : 1
          addonTotal += addon.price * qty
          return { addon_id: sel.addonId, quantity: qty }
        })
    }
  }

  const totalPrice = serviceType.base_price + addonTotal

  // 4. Insert booking
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      user_id: user.id,
      service_type_id: serviceTypeId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      address,
      notes: notes || null,
      total_price: totalPrice,
      status: 'pending',
    })
    .select()
    .single()

  if (bookingError || !booking) {
    console.error('[Booking Insert Error]', bookingError)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // 5. Insert booking_addons
  if (addonRows.length > 0) {
    await admin.from('booking_addons').insert(
      addonRows.map((row) => ({ ...row, booking_id: booking.id }))
    )
  }

  // 6. Mark availability slot as booked
  if (availabilityId) {
    await admin
      .from('availability')
      .update({ is_booked: true })
      .eq('id', availabilityId)
  }

  // 7. Fetch user profile for notifications
  const { data: userProfile } = await admin
    .from('users')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  const fullName = userProfile?.full_name ?? 'Customer'
  const phone = userProfile?.phone ?? null

  // 8. Fetch addon details for email
  let addonItemsForEmail: { name: string; quantity: number; price: number }[] = []
  if (addonRows.length > 0) {
    const { data: addonDetails } = await admin
      .from('addons')
      .select('id, name, price')
      .in('id', addonRows.map((r) => r.addon_id))

    if (addonDetails) {
      addonItemsForEmail = addonRows.map((row) => {
        const detail = addonDetails.find((a) => a.id === row.addon_id)!
        return { name: detail.name, quantity: row.quantity, price: detail.price }
      })
    }
  }

  const bedroomLabel: Record<string, string> = {
    studio: 'Studio', '1br': '1 Bedroom', '2br': '2 Bedrooms',
    '3br': '3 Bedrooms', '4br': '4 Bedrooms',
  }
  const serviceLabel = `${serviceType.property_type === 'condo' ? 'Condo' : 'House'} — ${bedroomLabel[serviceType.bedroom_count] ?? serviceType.bedroom_count}`

  const bookingForNotification = {
    booking_date: booking.booking_date,
    booking_time: booking.booking_time,
    address: booking.address,
    total_price: booking.total_price,
  }

  // 9. Send SMS (non-blocking failure)
  if (phone) {
    try {
      const smsBody = buildConfirmationSms(bookingForNotification, { full_name: fullName })
      const smsResult = await sendSms({ to: phone, body: smsBody })
      await admin.from('notifications').insert({
        booking_id: booking.id,
        type: 'confirmation',
        channel: 'sms',
        status: smsResult.success ? 'sent' : 'failed',
      })
    } catch (err) {
      console.error('[SMS notification error]', err)
    }
  }

  // 10. Send email (non-blocking failure)
  try {
    const emailHtml = buildConfirmationEmail(
      bookingForNotification,
      { full_name: fullName },
      serviceLabel,
      addonItemsForEmail
    )
    const emailResult = await sendEmail({
      to: user.email!,
      subject: "Your Mami's Angels booking is confirmed",
      html: emailHtml,
    })
    await admin.from('notifications').insert({
      booking_id: booking.id,
      type: 'confirmation',
      channel: 'email',
      status: emailResult.success ? 'sent' : 'failed',
    })
  } catch (err) {
    console.error('[Email notification error]', err)
  }

  return NextResponse.json({ bookingId: booking.id }, { status: 201 })
}
