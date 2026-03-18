'use client'

import { useState } from 'react'
import { PLANS, PlanKey } from '@/lib/razorpay'
import { differenceInDays } from 'date-fns'

interface Props {
  subscription: { plan: string; status: string; trial_ends_at: string } | null
}

declare global {
  interface Window { Razorpay: any }
}

const PLAN_KEYS: PlanKey[] = ['base', 'standard', 'premium']

export default function SubscriptionBanner({ subscription }: Props) {
  const [showPlans, setShowPlans] = useState(false)
  const [loading, setLoading] = useState<PlanKey | null>(null)

  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), new Date()))
    : 14

  const handleSubscribe = async (plan: PlanKey) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { order_id, amount, currency, key_id } = await res.json()

      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        await new Promise<void>((resolve) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => resolve()
          document.head.appendChild(s)
        })
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        order_id,
        name: 'Sathi Health',
        description: `${PLANS[plan].name} Plan`,
        theme: { color: '#10b981' },
        handler: () => {
          window.location.reload()
        },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-lg">
            {trialDaysLeft > 0 ? `🎁 ${trialDaysLeft} days free trial left` : '⚠️ Trial ended'}
          </div>
          <p className="text-green-100 text-sm mt-1">
            Subscribe to keep monitoring your parents' health
          </p>
        </div>
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="bg-white text-green-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition"
        >
          {showPlans ? 'Hide' : 'See plans'}
        </button>
      </div>

      {showPlans && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PLAN_KEYS.map(key => {
            const plan = PLANS[key]
            return (
              <div key={key} className="bg-white/20 rounded-xl p-4 text-white">
                <div className="font-bold text-lg">{plan.name}</div>
                <div className="text-2xl font-bold mt-1">
                  ₹{(plan.amount / 100).toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-green-100">/mo</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-green-100">✓ {f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key}
                  className="mt-3 w-full bg-white text-green-700 font-semibold py-2 rounded-lg text-sm hover:bg-green-50 disabled:opacity-50"
                >
                  {loading === key ? 'Loading...' : 'Subscribe'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
