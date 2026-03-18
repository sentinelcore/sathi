import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL || 'hello@sathi.health'

export async function sendDailySummaryEmail(params: {
  to: string
  childName: string
  parentName: string
  summaryText: string
  summaryShort: string
  healthScore: number
  readings: Array<{ metric: string; value: string; status: string }>
  date: string
  appUrl: string
}): Promise<boolean> {
  const scoreColor = params.healthScore >= 80 ? '#10b981' : params.healthScore >= 60 ? '#f97316' : '#ef4444'
  const scoreLabel = params.healthScore >= 80 ? 'Good' : params.healthScore >= 60 ? 'Fair' : 'Needs attention'

  const readingsHtml = params.readings
    .map(r => {
      const statusColor = r.status === 'normal' ? '#10b981' : r.status === 'elevated' ? '#f97316' : '#ef4444'
      return `<tr>
        <td style="padding:8px 0;color:#374151;">${r.metric}</td>
        <td style="padding:8px 0;font-weight:600;">${r.value}</td>
        <td style="padding:8px 0;color:${statusColor};text-transform:capitalize;">${r.status}</td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:#10b981;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">साथी Sathi</h1>
      <p style="color:#d1fae5;margin:4px 0 0;font-size:14px;">Daily Health Update — ${params.date}</p>
    </div>
    <!-- Body -->
    <div style="padding:24px;">
      <p style="color:#374151;font-size:16px;">Hi ${params.childName},</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;">${params.summaryText}</p>

      <!-- Health Score -->
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
        <div style="font-size:48px;font-weight:700;color:${scoreColor};">${params.healthScore}</div>
        <div style="font-size:14px;color:#6b7280;">Health Score — <strong style="color:${scoreColor};">${scoreLabel}</strong></div>
      </div>

      <!-- Readings Table -->
      ${params.readings.length > 0 ? `
      <h3 style="color:#111827;font-size:16px;margin:20px 0 12px;">Today's Readings</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <th style="text-align:left;padding:8px 0;color:#9ca3af;font-size:13px;font-weight:500;">Metric</th>
          <th style="text-align:left;padding:8px 0;color:#9ca3af;font-size:13px;font-weight:500;">Value</th>
          <th style="text-align:left;padding:8px 0;color:#9ca3af;font-size:13px;font-weight:500;">Status</th>
        </tr>
        ${readingsHtml}
      </table>` : '<p style="color:#9ca3af;">No readings recorded today.</p>'}

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${params.appUrl}/dashboard" style="background:#10b981;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">
          View Full Dashboard →
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Sathi — Caring for your loved ones from afar<br>
        <a href="${params.appUrl}/settings" style="color:#10b981;">Manage notifications</a>
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `${params.parentName}'s health update — ${params.date} ${params.healthScore >= 80 ? '✅' : params.healthScore >= 60 ? '⚠️' : '🔴'}`,
      html,
    })
    return true
  } catch (err) {
    console.error('[Resend] Email failed:', err)
    return false
  }
}

export async function sendInviteEmail(params: {
  to: string
  childName: string
  inviteLink: string
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `${params.childName} has set up Sathi for you`,
      html: `<p>Your family has set up Sathi, a health companion app, to help keep you healthy.</p>
<p><a href="${params.inviteLink}">Click here to get started →</a></p>`,
    })
    return true
  } catch (err) {
    console.error('[Resend] Invite email failed:', err)
    return false
  }
}
