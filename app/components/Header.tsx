'use client'

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import HeaderSearch from './HeaderSearch'
import MobileMenu from './MobileMenu'

export default function Header() {
  return (
    <nav className="bg-blue-600 text-white p-4">
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

          <Link href="/add" className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
            + Add Location
          </Link>

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100">
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
