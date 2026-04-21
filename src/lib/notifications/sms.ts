import 'server-only'

interface SendSmsParams {
  to: string
  body: string
}

export async function sendSms({ to, body }: SendSmsParams): Promise<{ success: boolean; error?: string }> {
  try {
    const twilio = (await import('twilio')).default
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
      body,
    })
    return { success: true }
  } catch (err) {
    console.error('[Twilio SMS Error]', err)
    return { success: false, error: String(err) }
  }
}
