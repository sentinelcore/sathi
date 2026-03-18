import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS, formatAlertSMS } from '@/lib/twilio'

// Send an SOS alert — called when elder hits the SOS button
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, message } = await request.json()
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sathi.health'

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: families } = await supabase
    .from('families')
    .select('nri_user_id, profiles!families_nri_user_id_fkey(phone, email, full_name)')
    .eq('parent_user_id', user.id)

  const parentName = profile?.full_name || 'Your parent'
  const alertMessage = type === 'sos'
    ? `🚨 SOS ALERT! ${parentName} has pressed the emergency button and needs help immediately!`
    : message || `Alert from ${parentName}`

  const results = []
  for (const family of families || []) {
    const nri = family.profiles as any
    if (!nri) continue

    // Create alert in DB
    await supabase.from('alerts').insert({
      parent_user_id: user.id,
      nri_user_id: family.nri_user_id,
      alert_type: type === 'sos' ? 'sos' : 'abnormal_reading',
      message: alertMessage,
      severity: type === 'sos' ? 'critical' : 'high',
    })

    // Send SMS
    if (nri.phone) {
      const sent = await sendSMS(nri.phone, formatAlertSMS(parentName, alertMessage, APP_URL))
      results.push({ nri: nri.full_name, smsSent: sent })
    }
  }

  return NextResponse.json({ success: true, notified: results.length, results })
}
