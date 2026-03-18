import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch role and redirect to appropriate UI
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  if (!profile.onboarding_complete) redirect('/auth/onboarding')

  if (profile.role === 'elderly_parent') redirect('/home')
  if (profile.role === 'nri_child') redirect('/dashboard')

  redirect('/auth/login')
}
