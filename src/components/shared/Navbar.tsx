'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface NavbarProps {
  user?: { full_name: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-pixel-navy border-b-4 border-pixel-blue sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
            <Image
              src="/logo-nav.png"
              alt="Mommy's Angels"
              width={72}
              height={44}
              className="h-11 w-auto"
              priority
            />
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/book"
                  className={cn(
                    'px-3 py-2 text-xs font-pixel transition-colors',
                    pathname === '/book'
                      ? 'text-white'
                      : 'text-pixel-light hover:text-white'
                  )}
                >
                  Book
                </Link>
                <Link
                  href="/bookings"
                  className={cn(
                    'px-3 py-2 text-xs font-pixel transition-colors',
                    pathname === '/bookings'
                      ? 'text-white'
                      : 'text-pixel-light hover:text-white'
                  )}
                >
                  Bookings
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    'px-3 py-2 text-xs font-pixel transition-colors',
                    pathname === '/profile'
                      ? 'text-white'
                      : 'text-pixel-light hover:text-white'
                  )}
                >
                  {user.full_name || 'Profile'}
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="ml-1 px-3 py-2 text-xs font-pixel text-pixel-light hover:text-white transition-colors"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-pixel text-pixel-light hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/book"
                  className="ml-2 px-4 py-2 text-xs font-pixel bg-pixel-blue text-white border-2 border-pixel-light shadow-[2px_2px_0px_#6BA7D0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
