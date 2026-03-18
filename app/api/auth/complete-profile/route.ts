import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full_name, date_of_birth, conditions, invite_token } = await request.json()

  // Update profile
  await supabase.from('profiles').update({
    full_name,
    date_of_birth,
    conditions,
    onboarding_complete: true,
  }).eq('id', user.id)

  // If they came via invite token, link them to the family
  if (invite_token) {
    const serviceClient = createServiceClient()
    const { data: family } = await serviceClient
      .from('families')
      .select('id')
      .eq('invite_token', invite_token)
      .is('invite_accepted_at', null)
      .single()

    if (family) {
      await serviceClient.from('families').update({
        parent_user_id: user.id,
        invite_accepted_at: new Date().toISOString(),
      }).eq('id', family.id)
    }
  }

  return NextResponse.json({ success: true })
}
