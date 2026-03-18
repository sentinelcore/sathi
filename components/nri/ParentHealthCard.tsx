'use client'

import { format } from 'date-fns'
import { METRIC_ICONS, HEALTH_RANGES } from '@/lib/utils'
import HealthChart from './HealthChart'

interface Props {
  parent: any
  relationship: string
  summary: any
  readings: any[]
}

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600 bg-green-50' : s >= 60 ? 'text-orange-500 bg-orange-50' : 'text-red-600 bg-red-50'

const CONCERN_BADGE: Record<string, string> = {
  normal: 'bg-green-100 text-green-700',
  watch: 'bg-yellow-100 text-yellow-700',
  alert: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function ParentHealthCard({ parent, relationship, summary, readings }: Props) {
  // Get latest reading per metric type
  const latestReadings = readings.reduce((acc: any, r: any) => {
    if (!acc[r.metric_type] || new Date(r.recorded_at) > new Date(acc[r.metric_type].recorded_at)) {
      acc[r.metric_type] = r
    }
    return acc
  }, {})

  const bpReadings = readings.filter(r => r.metric_type === 'blood_pressure')
  const glucoseReadings = readings.filter(r => r.metric_type === 'blood_glucose')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Parent header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
            {parent.full_name?.[0] || '👴'}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-lg">{parent.full_name}</div>
            <div className="text-gray-500 text-sm">{relationship} · {parent.conditions?.join(', ') || 'No conditions listed'}</div>
          </div>
        </div>

        {summary && (
          <div className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${CONCERN_BADGE[summary.concern_level] || CONCERN_BADGE.normal}`}>
            {summary.concern_level === 'normal' ? '✅ All good' :
             summary.concern_level === 'watch' ? '👀 Watch' :
             summary.concern_level === 'alert' ? '⚠️ Alert' : '🚨 Urgent'}
          </div>
        )}
      </div>

      {/* AI Summary */}
      {summary ? (
        <div className="px-6 py-4 bg-green-50 border-b border-green-100">
          <div className="flex items-start gap-3">
            <div className={`text-2xl font-bold px-3 py-1 rounded-xl ${SCORE_COLOR(summary.health_score)}`}>
              {summary.health_score}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Today's AI Summary</div>
              <p className="text-gray-700 text-sm leading-relaxed">{summary.summary_text}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 text-center text-gray-400 text-sm">
          No summary yet for today — check back after readings are recorded
        </div>
      )}

      {/* Latest readings grid */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {['blood_pressure', 'blood_glucose', 'spo2', 'weight'].map(metricType => {
          const r = latestReadings[metricType]
          let value = '—'
          let status = 'normal'

          if (r) {
            if (metricType === 'blood_pressure' && r.systolic) {
              value = `${r.systolic}/${r.diastolic}`
              status = HEALTH_RANGES.blood_pressure.getStatus(r.systolic, r.diastolic)
            } else if (r.value_primary) {
              value = `${r.value_primary}`
              if (metricType === 'spo2') status = HEALTH_RANGES.spo2.getStatus(r.value_primary)
              if (metricType === 'blood_glucose') status = HEALTH_RANGES.blood_glucose.getStatus(r.value_primary)
            }
          }

          const statusColors: Record<string, string> = {
            normal: 'border-green-200 bg-green-50',
            elevated: 'border-orange-200 bg-orange-50',
            low: 'border-blue-200 bg-blue-50',
            critical: 'border-red-200 bg-red-50',
          }

          return (
            <div
              key={metricType}
              className={`rounded-xl border p-3 text-center ${r ? statusColors[status] || statusColors.normal : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="text-2xl mb-1">{METRIC_ICONS[metricType]}</div>
              <div className="text-lg font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {metricType === 'blood_pressure' ? 'BP (mmHg)' :
                 metricType === 'blood_glucose' ? 'Glucose (mg/dL)' :
                 metricType === 'spo2' ? 'SpO2 (%)' : 'Weight (kg)'}
              </div>
              {r && (
                <div className="text-xs text-gray-400 mt-1">
                  {format(new Date(r.recorded_at), 'h:mm a')}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts */}
      {bpReadings.length > 2 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Blood Pressure (7 days)</h4>
          <HealthChart readings={bpReadings} metricType="blood_pressure" />
        </div>
      )}

      {glucoseReadings.length > 2 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Blood Glucose (7 days)</h4>
          <HealthChart readings={glucoseReadings} metricType="blood_glucose" />
        </div>
      )}
    </div>
  )
}
