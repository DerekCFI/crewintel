'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import QuickLogForm from '../../components/QuickLogForm'

function QuickLogContent() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-brand-navy">
              CrewIntel
            </h1>
          </Link>
          <p className="text-sm text-gray-600 mt-1">Quick Log</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-brand-navy mb-4">
              Sign in to Quick Log
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to submit reviews.
            </p>
            <SignInButton mode="modal">
              <button className="bg-brand-orange text-white px-8 py-3 rounded-lg font-semibold min-h-[44px] hover:bg-brand-orange/90 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-safe">
      {/* Minimal header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold text-brand-navy">
            CrewIntel
          </h1>
        </Link>
        <p className="text-sm text-gray-600 mt-1">Quick Log</p>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto">
        <QuickLogForm />
      </div>

      {/* Footer link */}
      <div className="max-w-lg mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need to add more details?{' '}
          <Link href="/add" className="text-brand-blue hover:underline">
            Use the full review form
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function QuickLogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full" />
      </div>
    }>
      <QuickLogContent />
    </Suspense>
  )
}
