import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NRINav from '@/components/nri/NRINav'

export const metadata: Metadata = {
  title: 'Sathi Dashboard',
}

export default async function NRILayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'nri_child') redirect('/home')

  return (
    <div className="min-h-screen bg-gray-50">
      <NRINav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
