import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

// Health ranges for common metrics
export const HEALTH_RANGES = {
  blood_pressure: {
    label: 'Blood Pressure',
    unit: 'mmHg',
    getStatus(systolic: number, diastolic: number) {
      if (systolic >= 180 || diastolic >= 120) return 'critical'
      if (systolic >= 140 || diastolic >= 90) return 'elevated'
      if (systolic < 90 || diastolic < 60) return 'low'
      return 'normal'
    },
  },
  blood_glucose: {
    label: 'Blood Glucose',
    unit: 'mg/dL',
    getStatus(value: number, isFasting = false) {
      if (isFasting) {
        if (value >= 126) return 'elevated'
        if (value < 70) return 'low'
        if (value >= 100) return 'watch'
        return 'normal'
      }
      if (value >= 200) return 'elevated'
      if (value < 70) return 'low'
      return 'normal'
    },
  },
  spo2: {
    label: 'Oxygen Level',
    unit: '%',
    getStatus(value: number) {
      if (value < 90) return 'critical'
      if (value < 95) return 'elevated'
      return 'normal'
    },
  },
  weight: {
    label: 'Weight',
    unit: 'kg',
    getStatus() { return 'normal' as const },
  },
  heart_rate: {
    label: 'Heart Rate',
    unit: 'bpm',
    getStatus(value: number) {
      if (value > 130 || value < 40) return 'critical'
      if (value > 100 || value < 50) return 'elevated'
      return 'normal'
    },
  },
}

export type MetricStatus = 'normal' | 'watch' | 'elevated' | 'low' | 'critical'

export const STATUS_COLORS: Record<MetricStatus, string> = {
  normal: 'text-green-600 bg-green-50',
  watch: 'text-yellow-600 bg-yellow-50',
  elevated: 'text-orange-600 bg-orange-50',
  low: 'text-blue-600 bg-blue-50',
  critical: 'text-red-600 bg-red-50',
}

export const METRIC_ICONS: Record<string, string> = {
  blood_pressure: '🩸',
  blood_glucose: '💉',
  spo2: '🫁',
  weight: '⚖️',
  heart_rate: '❤️',
  temperature: '🌡️',
  steps: '👣',
}
