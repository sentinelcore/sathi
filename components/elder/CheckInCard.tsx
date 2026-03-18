'use client'

interface Metric {
  id: string
  label: string
  icon: string
  hint: string
}

interface Props {
  metric: Metric
  isCompleted: boolean
  reading?: any
  onClick: () => void
}

export default function CheckInCard({ metric, isCompleted, reading, onClick }: Props) {
  const getDisplayValue = () => {
    if (!reading) return null
    if (reading.systolic) return `${reading.systolic}/${reading.diastolic} mmHg`
    return `${reading.value_primary} ${reading.unit || ''}`
  }

  const displayValue = getDisplayValue()

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-5 flex items-center gap-4 shadow-sm border-2 active:scale-95 transition-transform text-left ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100 hover:border-green-200'
      }`}
    >
      <div className="text-4xl">{metric.icon}</div>
      <div className="flex-1">
        <div className="text-xl font-semibold text-gray-900">{metric.label}</div>
        {isCompleted && displayValue ? (
          <div className="text-green-600 text-lg font-medium mt-0.5">{displayValue}</div>
        ) : (
          <div className="text-gray-400 text-base mt-0.5">Tap to record</div>
        )}
      </div>
      <div className={`text-2xl ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
        {isCompleted ? '✅' : '→'}
      </div>
    </button>
  )
}
