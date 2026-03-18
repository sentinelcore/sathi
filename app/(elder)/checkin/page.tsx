'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const METRIC_CONFIG: Record<string, { label: string; icon: string; fields: string[] }> = {
  blood_pressure: { label: 'Blood Pressure', icon: '🩸', fields: ['systolic', 'diastolic'] },
  blood_glucose:  { label: 'Blood Sugar',    icon: '💉', fields: ['value'] },
  spo2:           { label: 'Oxygen Level',   icon: '🫁', fields: ['value'] },
  weight:         { label: 'Weight',         icon: '⚖️', fields: ['value'] },
}

type Step = 'method' | 'camera' | 'confirm' | 'manual'

export default function CheckInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metricId = searchParams.get('metric') || 'blood_pressure'
  const config = METRIC_CONFIG[metricId] || METRIC_CONFIG.blood_pressure

  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('method')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [manualSystolic, setManualSystolic] = useState('')
  const [manualDiastolic, setManualDiastolic] = useState('')
  const [manualValue, setManualValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhotoCapture = async (file: File) => {
    setPhoto(file)
    const objectUrl = URL.createObjectURL(file)
    setPhotoUrl(objectUrl)
    setLoading(true)

    try {
      // Upload photo to Supabase Storage
      const { data: { user } } = await supabase.auth.getUser()
      const filePath = `readings/${user!.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('health-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('health-photos')
        .getPublicUrl(filePath)

      // Call Claude OCR
      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      })

      const ocr = await res.json()
      setOcrResult({ ...ocr, storedPhotoUrl: publicUrl })
      setStep('confirm')
    } catch (err) {
      toast.error("Couldn't read the photo. Please enter manually.")
      setStep('manual')
    } finally {
      setLoading(false)
    }
  }

  const confirmReading = async () => {
    setLoading(true)
    try {
      const body: any = {
        metric_type: ocrResult.metric_type !== 'unknown' ? ocrResult.metric_type : metricId,
        entry_method: 'photo',
        photo_url: ocrResult.storedPhotoUrl,
        ai_confidence: ocrResult.confidence,
      }

      if (ocrResult.systolic) {
        body.systolic = ocrResult.systolic
        body.diastolic = ocrResult.diastolic
        body.unit = 'mmHg'
      } else {
        body.value_primary = ocrResult.value
        body.unit = ocrResult.unit
      }

      const res = await fetch('/api/health/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success('Reading saved! ✅')
      router.push('/home')
    } catch {
      toast.error('Could not save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveManual = async () => {
    setLoading(true)
    try {
      const body: any = { metric_type: metricId, entry_method: 'manual' }

      if (metricId === 'blood_pressure') {
        if (!manualSystolic || !manualDiastolic) {
          toast.error('Please enter both systolic and diastolic values')
          setLoading(false)
          return
        }
        body.systolic = parseInt(manualSystolic)
        body.diastolic = parseInt(manualDiastolic)
        body.unit = 'mmHg'
      } else {
        if (!manualValue) { toast.error('Please enter a value'); setLoading(false); return }
        body.value_primary = parseFloat(manualValue)
        body.unit = metricId === 'weight' ? 'kg' : metricId === 'spo2' ? '%' : 'mg/dL'
      }

      const res = await fetch('/api/health/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed')
      toast.success('Reading saved! ✅')
      router.push('/home')
    } catch {
      toast.error('Could not save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-green-500 text-white px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => router.push('/home')} className="text-2xl">←</button>
        <div>
          <h1 className="text-2xl font-bold">{config.icon} {config.label}</h1>
          <p className="text-green-100 text-base">Record today's reading</p>
        </div>
      </div>

      <div className="p-6">
        {/* METHOD SELECTION */}
        {step === 'method' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How would you like to record?</h2>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-left active:scale-95 transition-transform"
            >
              <div className="text-4xl mb-2">📸</div>
              <div className="text-xl font-semibold text-gray-900">Take a photo</div>
              <div className="text-gray-500 text-base mt-1">
                Take a photo of your device screen — we'll read it for you
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && handlePhotoCapture(e.target.files[0])}
            />

            <button
              onClick={() => setStep('manual')}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-6 text-left active:scale-95 transition-transform"
            >
              <div className="text-4xl mb-2">⌨️</div>
              <div className="text-xl font-semibold text-gray-900">Enter manually</div>
              <div className="text-gray-500 text-base mt-1">Type in the numbers yourself</div>
            </button>

            {loading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <div className="text-xl font-semibold">Reading your photo...</div>
                  <div className="text-gray-500 mt-2">This takes a few seconds</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OCR CONFIRM */}
        {step === 'confirm' && ocrResult && (
          <div className="space-y-6">
            {photoUrl && (
              <img src={photoUrl} alt="Your reading" className="w-full rounded-2xl object-cover max-h-64" />
            )}

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-gray-500 text-lg mb-1">We read:</div>
              <div className="text-4xl font-bold text-green-700">{ocrResult.display_value}</div>
              <div className="text-gray-400 text-sm mt-2">
                Confidence: {ocrResult.confidence === 'high' ? '✅ High' : ocrResult.confidence === 'medium' ? '⚠️ Medium' : '🔴 Low'}
              </div>
            </div>

            <p className="text-center text-xl text-gray-700">Is this correct?</p>

            <div className="space-y-3">
              <button
                onClick={confirmReading}
                disabled={loading}
                className="w-full bg-green-500 text-white rounded-2xl p-5 text-xl font-semibold"
              >
                {loading ? 'Saving...' : 'Yes, save this ✅'}
              </button>
              <button
                onClick={() => setStep('manual')}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-2xl p-4 text-lg"
              >
                No, enter manually
              </button>
            </div>
          </div>
        )}

        {/* MANUAL ENTRY */}
        {step === 'manual' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Enter your {config.label}</h2>

            {metricId === 'blood_pressure' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-lg text-gray-600 block mb-2">Systolic (top number)</label>
                  <input
                    type="number"
                    value={manualSystolic}
                    onChange={e => setManualSystolic(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-3xl font-bold outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-lg text-gray-600 block mb-2">Diastolic (bottom number)</label>
                  <input
                    type="number"
                    value={manualDiastolic}
                    onChange={e => setManualDiastolic(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-3xl font-bold outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-lg text-gray-600 block mb-2">
                  {metricId === 'weight' ? 'Weight (kg)' :
                   metricId === 'spo2' ? 'Oxygen level (%)' : 'Blood sugar (mg/dL)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualValue}
                  onChange={e => setManualValue(e.target.value)}
                  placeholder={metricId === 'spo2' ? '98' : metricId === 'weight' ? '65' : '120'}
                  className="w-full border-2 border-gray-200 focus:border-green-500 rounded-2xl p-4 text-3xl font-bold outline-none"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={saveManual}
                disabled={loading}
                className="w-full bg-green-500 text-white rounded-2xl p-5 text-xl font-semibold"
              >
                {loading ? 'Saving...' : 'Save Reading ✅'}
              </button>
              <button
                onClick={() => setStep('method')}
                className="w-full text-gray-400 py-2 text-base"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
