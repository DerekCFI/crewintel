'use client'

import { useState } from 'react'
import Link from 'next/link'
import HeaderSearch from './HeaderSearch'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-brand-navy/80 rounded transition-colors"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-brand-navy shadow-xl">
            <div className="p-4">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="mb-4 p-2 hover:bg-brand-navy/80 rounded transition-colors ml-auto block"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Search */}
              <div className="mb-6">
                <HeaderSearch />
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-4">
                <Link
                  href="/hotels"
                  className="text-white hover:bg-brand-navy/80 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Hotels
                </Link>
                <Link
                  href="/fbos"
                  className="text-white hover:bg-brand-navy/80 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  FBOs
                </Link>
                <Link
                  href="/rentals"
                  className="text-white hover:bg-brand-navy/80 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Car Rentals
                </Link>
                <Link
                  href="/restaurants"
                  className="text-white hover:bg-brand-navy/80 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Restaurants
                </Link>
                <Link
                  href="/add"
                  className="bg-brand-orange text-white px-4 py-2 rounded font-semibold hover:bg-brand-orange/90 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  + Add Location
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
