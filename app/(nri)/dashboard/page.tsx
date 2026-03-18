import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format, subDays } from 'date-fns'
import NRIDashboardClient from './NRIDashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch families + parent profiles with latest readings
  const { data: families } = await supabase
    .from('families')
    .select(`
      id, relationship, invite_phone, invite_accepted_at,
      parent:profiles!families_parent_user_id_fkey (
        id, full_name, date_of_birth, conditions
      )
    `)
    .eq('nri_user_id', user.id)
    .order('created_at')

  // Fetch alerts (unread)
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('nri_user_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  // For each parent, fetch today's summary and last 7 days readings
  const today = format(new Date(), 'yyyy-MM-dd')
  const since7d = subDays(new Date(), 7).toISOString()

  const parentData = await Promise.all(
    (families || [])
      .filter(f => f.parent)
      .map(async (family) => {
        const parentId = (family.parent as any).id

        const [summaryRes, readingsRes] = await Promise.all([
          supabase
            .from('daily_summaries')
            .select('*')
            .eq('parent_user_id', parentId)
            .eq('summary_date', today)
            .single(),
          supabase
            .from('health_readings')
            .select('metric_type, value_primary, systolic, diastolic, unit, recorded_at, is_abnormal')
            .eq('parent_user_id', parentId)
            .gte('recorded_at', since7d)
            .order('recorded_at', { ascending: true }),
        ])

        return {
          family,
          summary: summaryRes.data,
          readings: readingsRes.data || [],
        }
      })
  )

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at')
    .eq('nri_user_id', user.id)
    .single()

  return (
    <NRIDashboardClient
      families={families || []}
      parentData={parentData}
      alerts={alerts || []}
      subscription={subscription}
    />
  )
}
