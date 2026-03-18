import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, PLANS, PlanKey } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature') || ''
  const body = await request.text()

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = createServiceClient()

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const notes = payment.notes || {}
    const plan = notes.plan as PlanKey
    const nriUserId = notes.nri_user_id

    if (nriUserId && plan) {
      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabase.from('subscriptions').upsert({
        nri_user_id: nriUserId,
        plan,
        status: 'active',
        razorpay_payment_id: payment.id,
        amount_inr: payment.amount,
        billing_cycle: 'monthly',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'nri_user_id' })
    }
  }

  if (event.event === 'subscription.cancelled') {
    const sub = event.payload.subscription.entity
    const notes = sub.notes || {}
    if (notes.nri_user_id) {
      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('nri_user_id', notes.nri_user_id)
    }
  }

  return NextResponse.json({ received: true })
}
