'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

type Tab = 'dashboard' | 'locations' | 'reviews'

interface Stats {
  totalReviews: number
  totalLocations: number
  totalUsers: number
  recentReviews: number
  pendingLocations: number
  flaggedReviews: number
  pendingReviews: number
  reviewsByCategory: Array<{ category: string; count: string }>
}

interface Location {
  id: number
  business_slug: string
  location_name: string
  address: string
  category: string
  airport_code: string
  approved: boolean | null
  created_at: string
  review_count: string
  avg_rating: string
}

interface Review {
  id: number
  location_name: string
  category: string
  airport_code: string
  overall_rating: number
  review_text: string
  user_email: string | null
  flagged: boolean | null
  spam_score: number | null
  approved: boolean | null
  is_quick_log: boolean | null
  created_at: string
  business_slug: string
}

const ADMIN_EMAIL = 'derek@crewintel.org'

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [locationFilter, setLocationFilter] = useState('all')
  const [reviewFilter, setReviewFilter] = useState('all')

  // Check if user is authorized admin
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress
      setIsAuthorized(email === ADMIN_EMAIL)
    }
  }, [isLoaded, isSignedIn, user])

  // Fetch data based on active tab
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/locations?status=${locationFilter}`)
      if (res.ok) {
        const data = await res.json()
        setLocations(data.locations || [])
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }, [locationFilter])

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reviews?status=${reviewFilter}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }, [reviewFilter])

  useEffect(() => {
    if (!isAuthorized) return

    if (activeTab === 'dashboard') {
      fetchStats()
    } else if (activeTab === 'locations') {
      fetchLocations()
    } else if (activeTab === 'reviews') {
      fetchReviews()
    }
  }, [isAuthorized, activeTab, fetchStats, fetchLocations, fetchReviews])

  const approveLocation = async (id: number, approved: boolean) => {
    try {
      await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      })
      fetchLocations()
    } catch (err) {
      console.error('Failed to update location:', err)
    }
  }

  const deleteLocation = async (id: number) => {
    if (!confirm('Delete this location and all its reviews?')) return

    try {
      await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' })
      fetchLocations()
    } catch (err) {
      console.error('Failed to delete location:', err)
    }
  }

  const flagReview = async (id: number, flagged: boolean) => {
    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flagged })
      })
      fetchReviews()
    } catch (err) {
      console.error('Failed to update review:', err)
    }
  }

  const approveReview = async (id: number, approved: boolean) => {
    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      })
      fetchReviews()
      fetchStats()
    } catch (err) {
      console.error('Failed to update review:', err)
    }
  }

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return

    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      fetchReviews()
    } catch (err) {
      console.error('Failed to delete review:', err)
    }
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the admin panel.</p>
          <Link
            href="/sign-in"
            className="inline-block bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to access the admin panel.</p>
          <Link
            href="/"
            className="inline-block bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy/90"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">CrewIntel Admin</h1>
          <Link href="/" className="text-brand-blue font-medium">
            Back to Site
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'dashboard'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'locations'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'reviews'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500'
            }`}
          >
            Reviews
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-20">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-4">
            {/* Alert Cards */}
            {(stats.pendingLocations > 0 || stats.pendingReviews > 0 || stats.flaggedReviews > 0) && (
              <div className="space-y-2">
                {stats.pendingLocations > 0 && (
                  <div
                    onClick={() => { setLocationFilter('pending'); setActiveTab('locations') }}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex justify-between items-center cursor-pointer"
                  >
                    <span className="text-yellow-800">{stats.pendingLocations} location(s) pending approval</span>
                    <span className="text-yellow-600">View &rarr;</span>
                  </div>
                )}
                {stats.pendingReviews > 0 && (
                  <div
                    onClick={() => { setReviewFilter('pending'); setActiveTab('reviews') }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center cursor-pointer"
                  >
                    <span className="text-blue-800">{stats.pendingReviews} review(s) pending approval</span>
                    <span className="text-blue-600">View &rarr;</span>
                  </div>
                )}
                {stats.flaggedReviews > 0 && (
                  <div
                    onClick={() => { setReviewFilter('flagged'); setActiveTab('reviews') }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex justify-between items-center cursor-pointer"
                  >
                    <span className="text-red-800">{stats.flaggedReviews} review(s) flagged</span>
                    <span className="text-red-600">View &rarr;</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-brand-blue">{stats.totalReviews}</div>
                <div className="text-gray-500 text-sm">Total Reviews</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-green-600">{stats.totalLocations}</div>
                <div className="text-gray-500 text-sm">Total Locations</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
                <div className="text-gray-500 text-sm">Unique Users</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-orange-600">{stats.recentReviews}</div>
                <div className="text-gray-500 text-sm">Last 7 Days</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h2 className="font-semibold mb-3">Reviews by Category</h2>
              <div className="space-y-2">
                {stats.reviewsByCategory.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span className="capitalize">{cat.category}</span>
                    <span className="font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div>
            {/* Filter */}
            <div className="mb-4">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Locations ({locations.length})</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Locations List */}
            <div className="space-y-3">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{loc.location_name}</h3>
                      <p className="text-gray-500 text-sm">{loc.airport_code} &bull; {loc.category}</p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        loc.approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {loc.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 truncate">{loc.address}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    {loc.review_count} reviews &bull; {loc.avg_rating || 'N/A'} avg rating
                  </div>
                  <div className="flex gap-2">
                    {!loc.approved ? (
                      <button
                        onClick={() => approveLocation(loc.id, true)}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded font-medium text-sm active:bg-green-700"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => approveLocation(loc.id, false)}
                        className="flex-1 bg-yellow-500 text-white py-2.5 rounded font-medium text-sm active:bg-yellow-600"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => deleteLocation(loc.id)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded font-medium text-sm active:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {locations.length === 0 && (
                <div className="text-center text-gray-500 py-8">No locations found</div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {/* Filter */}
            <div className="mb-4">
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Reviews ({reviews.length})</option>
                <option value="pending">Pending Approval</option>
                <option value="flagged">Flagged Only</option>
              </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{review.location_name}</h3>
                      <p className="text-gray-500 text-sm">
                        {review.airport_code} &bull; {review.category} &bull; {'★'.repeat(review.overall_rating)}{'☆'.repeat(5 - review.overall_rating)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-2 justify-end">
                      {review.is_quick_log && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          Quick Log
                        </span>
                      )}
                      {review.approved === true && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          Approved
                        </span>
                      )}
                      {review.approved === null && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                      {review.spam_score !== null && review.spam_score > 0 && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          review.spam_score >= 60 ? 'bg-red-100 text-red-700' :
                          review.spam_score >= 30 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          Spam: {review.spam_score}
                        </span>
                      )}
                      {review.flagged && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                          Flagged
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-3">{review.review_text || '(No review text)'}</p>
                  <div className="text-xs text-gray-400 mb-3">
                    {review.user_email || 'Anonymous'} &bull; {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {review.approved !== true ? (
                      <button
                        onClick={() => approveReview(review.id, true)}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded font-medium text-sm active:bg-green-700"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => approveReview(review.id, false)}
                        className="flex-1 bg-yellow-500 text-white py-2.5 rounded font-medium text-sm active:bg-yellow-600"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => flagReview(review.id, !review.flagged)}
                      className={`flex-1 py-2.5 rounded font-medium text-sm ${
                        review.flagged
                          ? 'bg-gray-200 text-gray-700 active:bg-gray-300'
                          : 'bg-orange-500 text-white active:bg-orange-600'
                      }`}
                    >
                      {review.flagged ? 'Unflag' : 'Mark Spam'}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded font-medium text-sm active:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center text-gray-500 py-8">No reviews found</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
