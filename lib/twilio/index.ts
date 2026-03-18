import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const FROM = process.env.TWILIO_PHONE_NUMBER!

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    await client.messages.create({ body, from: FROM, to })
    return true
  } catch (err) {
    console.error('[Twilio] SMS failed:', err)
    return false
  }
}

export function formatDailySummaryForSMS(
  parentName: string,
  summaryShort: string,
  healthScore: number,
  appUrl: string,
  date: string
): string {
  const scoreEmoji = healthScore >= 80 ? '✅' : healthScore >= 60 ? '⚠️' : '🔴'
  return `${scoreEmoji} Sathi Daily Update — ${parentName} (${date})

${summaryShort}

Health score: ${healthScore}/100
View full report: ${appUrl}/dashboard

Reply STOP to unsubscribe.`
}

export function formatAlertSMS(
  parentName: string,
  alertMessage: string,
  appUrl: string
): string {
  return `🚨 Sathi Alert — ${parentName}

${alertMessage}

View details: ${appUrl}/dashboard`
}
