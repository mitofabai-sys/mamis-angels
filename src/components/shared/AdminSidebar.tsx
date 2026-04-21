'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { href: '/admin/cleaners', label: 'Cleaners', icon: '🧹' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <div>
            <p className="text-sm font-bold text-pink-600 leading-tight">Mommy&apos;s Angels</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-pink-50 text-pink-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span>🚪</span>
            Log out
          </button>
        </form>
      </div>
    </aside>
  )
}
