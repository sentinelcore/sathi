'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const COMMON_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Heart disease', 'Arthritis',
  'Asthma', 'Kidney disease', 'Thyroid', 'Cholesterol',
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token')
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const toggleCondition = (c: string) => {
    setSelectedConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const complete = async () => {
    if (!fullName.trim()) return toast.error('Please enter your name')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const res = await fetch('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: dob || null,
        conditions: selectedConditions,
        invite_token: inviteToken,
      }),
    })

    setLoading(false)
    if (!res.ok) return toast.error('Something went wrong, please try again')

    toast.success(`Welcome to Sathi, ${fullName}! 🎉`)
    router.push(profile?.role === 'elderly_parent' ? '/home' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pt-16 max-w-lg mx-auto">
      {/* Step 1 — Name */}
      {step === 1 && (
        <div className="flex-1">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your name?</h2>
          <p className="text-gray-500 text-lg mb-8">So we can personalise your experience</p>

          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-xl outline-none mb-6"
            autoFocus
          />

          <button
            onClick={() => { if (fullName.trim()) setStep(2) }}
            disabled={!fullName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-2xl p-5 text-xl font-semibold"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 — Date of birth (optional for elder) */}
      {step === 2 && (
        <div className="flex-1">
          <div className="text-5xl mb-4">🎂</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Date of birth</h2>
          <p className="text-gray-500 text-lg mb-8">This helps us give you the right health insights</p>

          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-xl outline-none mb-4"
          />

          <div className="space-y-3 mt-4">
            <button
              onClick={() => setStep(3)}
              className="w-full bg-green-500 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              Next →
            </button>
            <button onClick={() => setStep(3)} className="w-full text-gray-400 py-2">
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Health conditions */}
      {step === 3 && (
        <div className="flex-1">
          <div className="text-5xl mb-4">🏥</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Any health conditions?</h2>
          <p className="text-gray-500 text-lg mb-6">Select any that apply. This helps Sathi monitor you better.</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {COMMON_CONDITIONS.map(c => (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                className={`px-4 py-3 rounded-full text-base font-medium border-2 transition-all ${
                  selectedConditions.includes(c)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={complete}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              {loading ? 'Setting up...' : "I'm ready! 🎉"}
            </button>
            <button onClick={complete} disabled={loading} className="w-full text-gray-400 py-2">
              No conditions, continue
            </button>
          </div>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step ? 'w-6 bg-green-500' : s < step ? 'w-2 bg-green-300' : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
