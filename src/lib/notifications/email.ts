import 'server-only'
import { Resend } from 'resend'

// Lazy initialization so the build doesn't fail without env vars
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Mami's Angels <bookings@mamis-angels.com>",
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[Resend Email Error]', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
