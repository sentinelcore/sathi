'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils'

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  high:     'bg-orange-50 border-orange-200 text-orange-800',
  medium:   'bg-yellow-50 border-yellow-200 text-yellow-800',
  low:      'bg-blue-50 border-blue-200 text-blue-800',
}

const SEVERITY_ICONS: Record<string, string> = {
  critical: '🚨', high: '⚠️', medium: '👀', low: 'ℹ️',
}

interface Props {
  alerts: any[]
}

export default function AlertsBanner({ alerts }: Props) {
  const supabase = createClient()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const dismiss = async (id: string) => {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id)
    setDismissed(prev => new Set(prev).add(id))
  }

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map(alert => (
        <div
          key={alert.id}
          className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium}`}
        >
          <span className="text-xl mt-0.5">{SEVERITY_ICONS[alert.severity] || '👀'}</span>
          <div className="flex-1">
            <p className="font-medium text-sm">{alert.message}</p>
            <p className="text-xs opacity-70 mt-0.5">{formatTime(alert.created_at)}</p>
          </div>
          <button
            onClick={() => dismiss(alert.id)}
            className="text-lg opacity-50 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
