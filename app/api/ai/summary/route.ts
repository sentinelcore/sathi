import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateDailySummary } from '@/lib/claude'
import { sendSMS, formatDailySummaryForSMS } from '@/lib/twilio'
import { sendDailySummaryEmail } from '@/lib/resend'
import { format } from 'date-fns'

// Called by scheduled job or manually to generate + deliver daily summary
export async function POST(request: NextRequest) {
  // Verify internal call via header
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { parent_user_id, date } = await request.json()
  const supabase = createServiceClient()
  const summaryDate = date || format(new Date(), 'yyyy-MM-dd')
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sathi.health'

  // Fetch parent profile
  const { data: parent } = await supabase
    .from('profiles')
    .select('full_name, conditions')
    .eq('id', parent_user_id)
    .single()

  if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

  // Fetch today's readings
  const { data: readings } = await supabase
    .from('health_readings')
    .select('*')
    .eq('parent_user_id', parent_user_id)
    .gte('recorded_at', `${summaryDate}T00:00:00Z`)
    .lte('recorded_at', `${summaryDate}T23:59:59Z`)
    .order('recorded_at', { ascending: true })

  // Map readings to summary input format
  const readingInputs = (readings || []).map(r => {
    let value = ''
    let status: 'normal' | 'elevated' | 'low' | 'critical' = 'normal'

    if (r.metric_type === 'blood_pressure' && r.systolic) {
      value = `${r.systolic}/${r.diastolic} mmHg`
      if (r.systolic >= 140) status = 'elevated'
      else if (r.systolic < 90) status = 'low'
    } else {
      value = `${r.value_primary} ${r.unit || ''}`
      if (r.is_abnormal) status = 'elevated'
    }

    return { metric: r.metric_type.replace(/_/g, ' '), value, status }
  })

  const expectedMetrics = ['blood_pressure', 'blood_glucose', 'spo2', 'weight']
  const recordedMetrics = (readings || []).map(r => r.metric_type)
  const missedReadings = expectedMetrics.filter(m => !recordedMetrics.includes(m))

  // Generate AI summary
  const summary = await generateDailySummary({
    parentName: parent.full_name || 'your parent',
    childName: 'your family',
    date: summaryDate,
    readings: readingInputs,
    conditions: parent.conditions || [],
    missedReadings: missedReadings.map(m => m.replace(/_/g, ' ')),
  })

  // Save to DB
  await supabase.from('daily_summaries').upsert({
    parent_user_id,
    summary_date: summaryDate,
    summary_text: summary.summary_text,
    summary_short: summary.summary_short,
    health_score: summary.health_score,
    has_concerns: summary.has_concerns,
    concern_level: summary.concern_level,
  })

  // Find NRI children linked to this parent
  const { data: families } = await supabase
    .from('families')
    .select('nri_user_id, profiles!families_nri_user_id_fkey(full_name, email, phone)')
    .eq('parent_user_id', parent_user_id)

  let smsSent = false
  let emailSent = false

  for (const family of families || []) {
    const nri = family.profiles as any
    if (!nri) continue

    // Send SMS
    if (nri.phone) {
      const smsText = formatDailySummaryForSMS(
        parent.full_name || 'your parent',
        summary.summary_short,
        summary.health_score,
        APP_URL,
        summaryDate
      )
      smsSent = await sendSMS(nri.phone, smsText)
    }

    // Send email
    if (nri.email) {
      emailSent = await sendDailySummaryEmail({
        to: nri.email,
        childName: nri.full_name || 'there',
        parentName: parent.full_name || 'your parent',
        summaryText: summary.summary_text,
        summaryShort: summary.summary_short,
        healthScore: summary.health_score,
        readings: readingInputs,
        date: summaryDate,
        appUrl: APP_URL,
      })
    }
  }

  // Update delivery status
  await supabase
    .from('daily_summaries')
    .update({ sms_sent: smsSent, email_sent: emailSent })
    .eq('parent_user_id', parent_user_id)
    .eq('summary_date', summaryDate)

  return NextResponse.json({ success: true, summary, smsSent, emailSent })
}
