import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HEALTH_RANGES } from '@/lib/utils'

// GET — fetch readings for a parent (NRI child can fetch linked parent's data)
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get('parent_id') || user.id
  const metricType = searchParams.get('metric_type')
  const days = parseInt(searchParams.get('days') || '7')

  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase
    .from('health_readings')
    .select('*')
    .eq('parent_user_id', parentId)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: false })

  if (metricType) query = query.eq('metric_type', metricType)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST — submit a new health reading (from elder parent)
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    metric_type,
    value_primary,
    value_secondary,
    systolic,
    diastolic,
    unit,
    entry_method = 'manual',
    photo_url,
    ai_confidence,
  } = body

  // Determine if reading is abnormal
  let is_abnormal = false
  if (metric_type === 'blood_pressure' && systolic) {
    const status = HEALTH_RANGES.blood_pressure.getStatus(systolic, diastolic || 0)
    is_abnormal = status !== 'normal'
  } else if (metric_type === 'spo2' && value_primary) {
    const status = HEALTH_RANGES.spo2.getStatus(value_primary)
    is_abnormal = status !== 'normal'
  } else if (metric_type === 'blood_glucose' && value_primary) {
    const status = HEALTH_RANGES.blood_glucose.getStatus(value_primary)
    is_abnormal = status !== 'normal'
  }

  const { data, error } = await supabase.from('health_readings').insert({
    parent_user_id: user.id,
    metric_type,
    value_primary,
    value_secondary,
    systolic,
    diastolic,
    unit,
    entry_method,
    photo_url,
    ai_confidence,
    is_abnormal,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If abnormal, create alert for NRI children
  if (is_abnormal) {
    const { data: families } = await supabase
      .from('families')
      .select('nri_user_id')
      .eq('parent_user_id', user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    for (const family of families || []) {
      await supabase.from('alerts').insert({
        parent_user_id: user.id,
        nri_user_id: family.nri_user_id,
        alert_type: 'abnormal_reading',
        metric_type,
        metric_value: systolic ? `${systolic}/${diastolic}` : `${value_primary} ${unit || ''}`,
        message: `${profile?.full_name || 'Your parent'} has an abnormal ${metric_type.replace(/_/g, ' ')} reading.`,
        severity: 'medium',
      })
    }
  }

  return NextResponse.json(data, { status: 201 })
}
