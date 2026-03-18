'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

const RELATIONSHIPS = ['Mother', 'Father', 'Parent', 'Grandmother', 'Grandfather', 'Other']

export default function InviteParentModal({ onClose }: Props) {
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Parent')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (phone.length < 10) return toast.error('Please enter a valid phone number')
    setLoading(true)

    const res = await fetch('/api/families', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        relationship,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      toast.error('Could not send invite. Please try again.')
      return
    }

    toast.success(`Invite sent to ${phone}! 🎉`)
    onClose()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Invite a parent</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          We'll send them a simple SMS with a link to set up Sathi on their phone. No app download needed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Their relationship to you</label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map(r => (
                <button
                  key={r}
                  onClick={() => setRelationship(r)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium ${
                    relationship === r
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Their mobile number (India)</label>
            <div className="flex rounded-xl border-2 border-gray-200 focus-within:border-green-500 overflow-hidden">
              <div className="bg-gray-50 px-3 flex items-center text-gray-500 text-sm border-r border-gray-200">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="flex-1 px-3 py-3 text-base outline-none"
                maxLength={10}
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleInvite}
            disabled={loading || phone.length < 10}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-xl py-3.5 font-semibold text-base"
          >
            {loading ? 'Sending...' : 'Send invite via SMS →'}
          </button>
        </div>
      </div>
    </div>
  )
}
