import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrder, PlanKey } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json() as { plan: PlanKey }
  if (!['base', 'standard', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const order = await createOrder(plan, user.id)
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('[Razorpay] Create order failed:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
