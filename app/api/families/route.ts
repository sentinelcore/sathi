import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import crypto from 'crypto'

// GET — fetch all parents linked to the NRI user
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('families')
    .select(`
      id, relationship, invite_phone, invite_accepted_at,
      parent:profiles!families_parent_user_id_fkey (
        id, full_name, phone, date_of_birth, conditions,
        health_readings (
          metric_type, value_primary, systolic, diastolic, unit, recorded_at, is_abnormal
        )
      )
    `)
    .eq('nri_user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — invite a parent by phone number
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, relationship = 'Parent' } = await request.json()
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sathi.health'
  const inviteToken = crypto.randomBytes(16).toString('hex')

  // Save family record with invite token
  const { data: family, error } = await supabase
    .from('families')
    .insert({
      nri_user_id: user.id,
      invite_phone: phone,
      invite_token: inviteToken,
      invite_sent_at: new Date().toISOString(),
      relationship,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch NRI name for SMS
  const { data: nriProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const inviteLink = `${APP_URL}/auth/login?token=${inviteToken}&role=elderly_parent`
  const smsText = `Hi! Your family has set up Sathi, your personal health companion app.

Open this link on your phone to get started:
${inviteLink}

Sathi will help your family keep track of your health from abroad. 💚`

  await sendSMS(phone, smsText)

  return NextResponse.json({ success: true, family })
}
