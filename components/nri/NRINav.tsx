'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NRINav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🫶</span>
          <span className="font-bold text-xl text-gray-900">Sathi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className={`text-sm font-medium ${pathname === '/settings' ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Settings
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
