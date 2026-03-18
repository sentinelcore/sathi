'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import ParentHealthCard from '@/components/nri/ParentHealthCard'
import InviteParentModal from '@/components/nri/InviteParentModal'
import AlertsBanner from '@/components/nri/AlertsBanner'
import SubscriptionBanner from '@/components/nri/SubscriptionBanner'

interface Props {
  families: any[]
  parentData: any[]
  alerts: any[]
  subscription: any
}

export default function NRIDashboardClient({ families, parentData, alerts, subscription }: Props) {
  const [showInvite, setShowInvite] = useState(false)

  const pendingInvites = families.filter(f => !f.parent && f.invite_phone)
  const linkedParents = parentData.filter(pd => pd.family.parent)

  return (
    <div className="space-y-6">
      {/* Subscription banner */}
      {(!subscription || subscription.status === 'trial') && (
        <SubscriptionBanner subscription={subscription} />
      )}

      {/* Alerts */}
      {alerts.length > 0 && <AlertsBanner alerts={alerts} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your family's health</h1>
          <p className="text-gray-500 text-sm mt-0.5">Daily updates from your loved ones</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          + Add parent
        </button>
      </div>

      {/* No parents yet */}
      {linkedParents.length === 0 && pendingInvites.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <div className="text-5xl mb-4">👨‍👩‍👴</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Add your first parent</h2>
          <p className="text-gray-500 mb-6">
            We'll send them a simple link via SMS to set up their Sathi app.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Invite parent →
          </button>
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.map(f => (
        <div key={f.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">⏳</div>
          <div>
            <div className="font-medium text-amber-900">Invite sent to {f.invite_phone}</div>
            <div className="text-amber-700 text-sm">Waiting for them to set up Sathi</div>
          </div>
          <div className="ml-auto">
            <button
              onClick={async () => {
                await fetch('/api/families', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phone: f.invite_phone, relationship: f.relationship }),
                })
                toast.success('Invite resent!')
              }}
              className="text-amber-700 text-sm underline"
            >
              Resend
            </button>
          </div>
        </div>
      ))}

      {/* Parent health cards */}
      {linkedParents.map(({ family, summary, readings }) => (
        <ParentHealthCard
          key={family.id}
          parent={family.parent}
          relationship={family.relationship}
          summary={summary}
          readings={readings}
        />
      ))}

      {/* Invite modal */}
      {showInvite && <InviteParentModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
