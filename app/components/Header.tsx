'use client'

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import HeaderSearch from './HeaderSearch'
import MobileMenu from './MobileMenu'

const ADMIN_EMAIL = 'derek@crewintel.org'

export default function Header() {
  const { user } = useUser()
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL

  return (
    <nav className="bg-brand-navy text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-work-sans)' }}>
          CrewIntel
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <HeaderSearch />

          <Link href="/hotels" className="hover:underline">
            Hotels
          </Link>
          <Link href="/fbos" className="hover:underline">
            FBOs
          </Link>
          <Link href="/rentals" className="hover:underline">
            Car Rentals
          </Link>
          <Link href="/restaurants" className="hover:underline">
            Restaurants
          </Link>

          <Link href="/add" className="bg-brand-orange text-white px-4 py-2 rounded font-semibold hover:bg-brand-orange/90">
            + Add Location
          </Link>

          <SignedIn>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-yellow-600"
                >
                  Admin
                </Link>
              )}
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-brand-navy px-4 py-2 rounded font-semibold hover:bg-gray-100">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-3">
          <SignedIn>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-yellow-500 text-white px-2.5 py-1 rounded text-xs font-semibold"
              >
                Admin
              </Link>
            )}
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-brand-navy px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
