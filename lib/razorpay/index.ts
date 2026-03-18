import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const PLANS = {
  base: {
    name: 'Base',
    amount: 99900,      // ₹999 in paise
    description: 'App for 1 parent, daily AI summary, medication reminders',
    features: [
      'App for 1 parent',
      'Manual health data entry',
      'Daily AI text summary',
      '7-day health trends',
      'Email alerts',
      'Medication reminders',
    ],
  },
  standard: {
    name: 'Standard',
    amount: 249900,     // ₹2,499 in paise
    description: 'Best for most families — 2 parents, device sync, voice notes',
    features: [
      'Everything in Base',
      'App for 2 parents',
      'BLE device sync (up to 3)',
      'Daily voice note (SMS + email)',
      '30-day trends + weekly report',
      'SMS + push alerts',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    amount: 499900,     // ₹4,999 in paise
    description: 'Complete care for up to 4 parents with wellness package',
    features: [
      'Everything in Standard',
      'Up to 4 parents',
      'AI companion chat (unlimited)',
      'Wellness package included',
      'Monthly video consultation',
      'Dedicated health manager',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

export async function createOrder(plan: PlanKey, nriUserId: string) {
  const planData = PLANS[plan]
  return await razorpay.orders.create({
    amount: planData.amount,
    currency: 'INR',
    receipt: `sathi_${nriUserId}_${Date.now()}`,
    notes: {
      plan,
      nri_user_id: nriUserId,
    },
  })
}

export function verifyPaymentSignature(params: {
  order_id: string
  payment_id: string
  signature: string
}): boolean {
  const body = `${params.order_id}|${params.payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === params.signature
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}
