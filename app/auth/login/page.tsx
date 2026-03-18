'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Step = 'choose' | 'phone' | 'otp' | 'email'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const inviteToken = searchParams.get('token')
  const forceRole = searchParams.get('role') as 'elderly_parent' | 'nri_child' | null

  const [step, setStep] = useState<Step>(forceRole === 'elderly_parent' ? 'phone' : 'choose')
  const [role, setRole] = useState<'elderly_parent' | 'nri_child' | null>(forceRole)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  // If elder came via invite link, pre-select phone step
  useEffect(() => {
    if (inviteToken) {
      setRole('elderly_parent')
      setStep('phone')
    }
  }, [inviteToken])

  const sendOTP = async () => {
    if (!phone.trim()) return toast.error('Please enter your phone number')
    setLoading(true)
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
      options: { data: { role: 'elderly_parent' } },
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('OTP sent to your phone!')
    setStep('otp')
  }

  const verifyOTP = async () => {
    if (!otp.trim()) return toast.error('Please enter the OTP')
    setLoading(true)
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    if (data.user) {
      // Complete profile setup for new users
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', data.user.id)
        .single()
      if (!profile?.onboarding_complete) {
        router.push(`/auth/onboarding${inviteToken ? `?token=${inviteToken}` : ''}`)
      } else {
        router.push('/home')
      }
    }
  }

  const signInNRI = async () => {
    if (!email.trim() || !password.trim()) return toast.error('Please fill in all fields')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error?.message?.includes('Invalid login')) {
      // Try signup
      const { error: signupError } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: 'nri_child' } },
      })
      setLoading(false)
      if (signupError) return toast.error(signupError.message)
      toast.success('Account created! Please check your email to verify.')
      router.push('/auth/onboarding')
      return
    }
    setLoading(false)
    if (error) return toast.error(error.message)
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', data.user.id)
        .single()
      router.push(profile?.onboarding_complete ? '/dashboard' : '/auth/onboarding')
    }
  }

  // ── CHOOSE WHO YOU ARE ──────────────────────────────────────────
  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
        <div className="mb-10 text-center">
          <div className="text-5xl mb-3">🫶</div>
          <h1 className="text-3xl font-bold text-gray-900">Sathi</h1>
          <p className="text-gray-500 mt-1">Your family health companion</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => { setRole('elderly_parent'); setStep('phone') }}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-6 text-left shadow-md active:scale-95 transition-transform"
          >
            <div className="text-3xl mb-2">👴👵</div>
            <div className="text-xl font-semibold">I am the parent</div>
            <div className="text-green-100 text-sm mt-1">Log in with your mobile number</div>
          </button>

          <button
            onClick={() => { setRole('nri_child'); setStep('email') }}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-2xl p-6 text-left shadow-md border border-gray-200 active:scale-95 transition-transform"
          >
            <div className="text-3xl mb-2">🧑‍💻</div>
            <div className="text-xl font-semibold">I am the family member</div>
            <div className="text-gray-500 text-sm mt-1">Log in with your email</div>
          </button>
        </div>
      </div>
    )
  }

  // ── ELDER: PHONE NUMBER ENTRY ────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pt-16">
        <button onClick={() => setStep('choose')} className="text-gray-400 text-sm mb-8">← Back</button>
        <div className="flex-1">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your phone number</h2>
          <p className="text-gray-500 text-lg mb-8">We'll send you a code to log in</p>

          <div className="space-y-4">
            <div className="flex rounded-2xl border-2 border-gray-200 focus-within:border-green-500 overflow-hidden">
              <div className="bg-gray-50 px-4 flex items-center text-gray-500 text-lg font-medium border-r border-gray-200">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="flex-1 p-4 text-xl outline-none"
                maxLength={10}
                autoFocus
              />
            </div>

            <button
              onClick={sendOTP}
              disabled={loading || phone.length < 10}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ELDER: OTP VERIFICATION ──────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pt-16">
        <button onClick={() => setStep('phone')} className="text-gray-400 text-sm mb-8">← Back</button>
        <div className="flex-1">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter the code</h2>
          <p className="text-gray-500 text-lg mb-8">
            We sent a 6-digit code to<br />
            <strong className="text-gray-900">+91 {phone}</strong>
          </p>

          <div className="space-y-4">
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-3xl text-center font-bold tracking-widest outline-none"
              maxLength={6}
              autoFocus
            />

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length < 6}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-2xl p-5 text-xl font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={sendOTP}
              className="w-full text-green-600 text-base py-2"
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── NRI: EMAIL + PASSWORD ────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pt-16">
        <button onClick={() => setStep('choose')} className="text-gray-400 text-sm mb-8">← Back</button>
        <div className="flex-1">
          <div className="text-4xl mb-4">🧑‍💻</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Sathi</h2>
          <p className="text-gray-500 mb-8">Sign in or create a new account</p>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl p-4 text-lg outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border-2 border-gray-200 focus:border-green-500 rounded-xl p-4 text-lg outline-none"
            />

            <button
              onClick={signInNRI}
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl p-4 text-lg font-semibold"
            >
              {loading ? 'Please wait...' : 'Continue'}
            </button>

            <p className="text-center text-sm text-gray-400">
              New? We'll create your account automatically.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
