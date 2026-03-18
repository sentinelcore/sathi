import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sathi — Health Check-in',
}

export default function ElderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="elder-mode min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
