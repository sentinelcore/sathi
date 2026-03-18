'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import SOSButton from '@/components/elder/SOSButton'
import CheckInCard from '@/components/elder/CheckInCard'

interface Props {
  profile: { full_name: string | null; conditions: string[] | null; medications: any } | null
  todayReadings: any[]
  completedMetrics: string[]
}

const METRICS = [
  { id: 'blood_pressure', label: 'Blood Pressure', icon: '🩸', hint: 'e.g. 120/80' },
  { id: 'blood_glucose', label: 'Blood Sugar', icon: '💉', hint: 'mg/dL' },
  { id: 'spo2', label: 'Oxygen Level', icon: '🫁', hint: '%' },
  { id: 'weight', label: 'Weight', icon: '⚖️', hint: 'kg' },
]

export default function ElderHomeClient({ profile, todayReadings, completedMetrics }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showSOS, setShowSOS] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const allDone = METRICS.every(m => completedMetrics.includes(m.id))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-500 text-white px-6 pt-12 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-100 text-lg">{greeting},</p>
            <h1 className="text-3xl font-bold">{firstName} 🙏</h1>
            <p className="text-green-100 text-base mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-green-200 text-sm pt-1"
          >
            Logout
          </button>
        </div>

        {/* Daily progress */}
        <div className="mt-4 bg-white/20 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Today's check-in</span>
            <span className="text-white font-bold">{completedMetrics.length}/{METRICS.length}</span>
          </div>
          <div className="flex gap-2">
            {METRICS.map(m => (
              <div
                key={m.id}
                className={`flex-1 h-2 rounded-full ${
                  completedMetrics.includes(m.id) ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          {allDone && (
            <p className="text-white text-sm mt-2">✅ All done for today! Great job!</p>
          )}
        </div>
      </div>

      {/* Check-in cards */}
      <div className="px-6 py-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Tap to record your readings</h2>

        {METRICS.map(metric => (
          <CheckInCard
            key={metric.id}
            metric={metric}
            isCompleted={completedMetrics.includes(metric.id)}
            reading={todayReadings.find(r => r.metric_type === metric.id)}
            onClick={() => router.push(`/checkin?metric=${metric.id}`)}
          />
        ))}
      </div>

      {/* Medications reminder */}
      {profile?.medications && Array.isArray(profile.medications) && profile.medications.length > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">💊 Medications today</h3>
            {profile.medications.map((med: any, i: number) => (
              <div key={i} className="text-amber-700 text-base">{med.name} — {med.dose} ({med.frequency})</div>
            ))}
          </div>
        </div>
      )}

      {/* SOS Button */}
      <div className="px-6 pb-10">
        <SOSButton />
      </div>
    </div>
  )
}
