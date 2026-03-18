'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

interface Props {
  readings: any[]
  metricType: string
}

export default function HealthChart({ readings, metricType }: Props) {
  const data = readings.map(r => ({
    time: format(new Date(r.recorded_at), 'MMM d'),
    systolic: r.systolic,
    diastolic: r.diastolic,
    value: r.value_primary,
  }))

  const isBP = metricType === 'blood_pressure'

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />

          {isBP ? (
            <>
              <ReferenceLine y={140} stroke="#f97316" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="systolic" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
            </>
          ) : (
            <>
              {metricType === 'blood_glucose' && <ReferenceLine y={126} stroke="#f97316" strokeDasharray="4 4" />}
              {metricType === 'spo2' && <ReferenceLine y={95} stroke="#f97316" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
