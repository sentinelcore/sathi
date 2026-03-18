'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SOSButton() {
  const [pressed, setPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const startPress = () => {
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          sendSOS()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimer(interval)
    setPressed(true)
  }

  const cancelPress = () => {
    if (timer) clearInterval(timer)
    setPressed(false)
    setCountdown(0)
  }

  const sendSOS = async () => {
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sos' }),
      })
      toast.error('🚨 Emergency alert sent to your family!', { duration: 8000 })
    } catch {
      toast.error('Could not send alert. Please call your family directly.')
    }
    setPressed(false)
    setCountdown(0)
  }

  return (
    <div className="mt-4">
      <button
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        className={`w-full rounded-3xl p-6 font-bold text-white shadow-lg active:scale-95 transition-all select-none ${
          pressed
            ? 'bg-red-600 scale-95'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <div className="text-4xl mb-1">🆘</div>
        <div className="text-2xl">
          {pressed && countdown > 0 ? `Sending in ${countdown}...` : 'Emergency SOS'}
        </div>
        <div className="text-red-200 text-sm mt-1 font-normal">
          {pressed ? 'Release to cancel' : 'Hold for 3 seconds to alert family'}
        </div>
      </button>
    </div>
  )
}
