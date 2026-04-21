import 'server-only'
import { formatDate, formatTime } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface BookingData {
  booking_date: string
  booking_time: string
  address: string
  total_price: number
}

interface UserData {
  full_name: string
  phone?: string | null
}

interface AddonItem {
  name: string
  quantity: number
  price: number
}

export function buildConfirmationSms(booking: BookingData, user: UserData): string {
  return (
    `Hi ${user.full_name}, your Mami's Angels cleaning is confirmed for ` +
    `${formatDate(booking.booking_date)} at ${formatTime(booking.booking_time)} ` +
    `at ${booking.address}. Total: ${formatCurrency(booking.total_price)}. ` +
    `Reply HELP for questions.`
  )
}

export function buildConfirmationEmail(
  booking: BookingData,
  user: UserData,
  serviceLabel: string,
  addonItems: AddonItem[]
): string {
  const addonRows = addonItems.length > 0
    ? addonItems.map((a) =>
        `<tr>
          <td style="padding:4px 0;color:#555;">${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}</td>
          <td style="padding:4px 0;text-align:right;color:#555;">${formatCurrency(a.price * a.quantity)}</td>
        </tr>`
      ).join('')
    : '<tr><td colspan="2" style="color:#999;font-style:italic;">No add-ons</td></tr>'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f9f9f9;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
    <div style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);padding:32px;text-align:center;">
      <div style="font-size:40px;">🌸</div>
      <h1 style="margin:8px 0 4px;font-size:22px;color:#111;">Booking Confirmed!</h1>
      <p style="margin:0;color:#555;font-size:14px;">Mami&apos;s Angels Cleaning Services</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 20px;">Hi <strong>${user.full_name}</strong>, your cleaning appointment is confirmed. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#fdf2f8;">
          <td style="padding:10px 12px;font-weight:600;border-radius:8px 0 0 8px;">Service</td>
          <td style="padding:10px 12px;border-radius:0 8px 8px 0;">${serviceLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;">Date</td>
          <td style="padding:10px 12px;">${formatDate(booking.booking_date)}</td>
        </tr>
        <tr style="background:#fdf2f8;">
          <td style="padding:10px 12px;font-weight:600;border-radius:8px 0 0 8px;">Time</td>
          <td style="padding:10px 12px;border-radius:0 8px 8px 0;">${formatTime(booking.booking_time)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;">Address</td>
          <td style="padding:10px 12px;">${booking.address}</td>
        </tr>
      </table>

      ${addonItems.length > 0 ? `
      <h3 style="margin:20px 0 8px;font-size:14px;color:#666;">Add-ons</h3>
      <table style="width:100%;font-size:14px;">${addonRows}</table>
      ` : ''}

      <div style="margin-top:20px;padding-top:16px;border-top:2px solid #f3e8ff;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:16px;font-weight:700;">Total</span>
        <span style="font-size:22px;font-weight:800;color:#db2777;">${formatCurrency(booking.total_price)}</span>
      </div>

      <p style="margin-top:24px;font-size:13px;color:#777;">
        A cleaner will be assigned to your booking shortly. If you have questions, please reply to this email or contact us.
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px;text-align:center;font-size:12px;color:#999;">
      Mami&apos;s Angels Cleaning Services &bull; Philippines
    </div>
  </div>
</body>
</html>`
}
