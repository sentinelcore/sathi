import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import ElderHomeClient from './ElderHomeClient'

export default async function ElderHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, conditions, medications')
    .eq('id', user.id)
    .single()

  // Today's readings
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: todayReadings } = await supabase
    .from('health_readings')
    .select('metric_type, value_primary, systolic, diastolic, unit, recorded_at')
    .eq('parent_user_id', user.id)
    .gte('recorded_at', `${today}T00:00:00Z`)
    .order('recorded_at', { ascending: false })

  const completedMetrics = new Set((todayReadings || []).map(r => r.metric_type))

  return (
    <ElderHomeClient
      profile={profile}
      todayReadings={todayReadings || []}
      completedMetrics={Array.from(completedMetrics)}
    />
  )
}
