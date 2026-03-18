'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { PLANS } from '@/lib/razorpay'
import { formatDate } from '@/lib/utils'

interface Props {
  profile: any
  subscription: any
  userId: string
}

export default function SettingsClient({ profile, subscription, userId }: Props) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
    setSaving(false)
    toast.success('Profile updated!')
  }

  const plan = subscription?.plan ? PLANS[subscription.plan as keyof typeof PLANS] : null

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-base bg-gray-50 text-gray-400"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>

        {subscription && plan ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{plan.name} Plan</div>
                <div className="text-sm text-gray-500">₹{(subscription.amount_inr / 100).toLocaleString('en-IN')}/month</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {subscription.status === 'trial' ? 'Free trial' : subscription.status}
              </span>
            </div>
            {subscription.current_period_end && (
              <p className="text-sm text-gray-500">
                Next billing: {formatDate(subscription.current_period_end)}
              </p>
            )}
            {subscription.trial_ends_at && subscription.status === 'trial' && (
              <p className="text-sm text-amber-600">
                Trial ends: {formatDate(subscription.trial_ends_at)}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-4">You're on a free trial. Subscribe to continue after your trial ends.</p>
            <a href="/dashboard" className="text-green-600 font-medium text-sm hover:underline">
              View plans on dashboard →
            </a>
          </div>
        )}
      </div>

      {/* Notification preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Daily health summary (SMS)</span>
            <span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Daily health summary (Email)</span>
            <span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Abnormal reading alerts</span>
            <span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>SOS alerts</span>
            <span className="text-green-600 font-medium">✓ Always on</span>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            Fine-grained notification controls coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
