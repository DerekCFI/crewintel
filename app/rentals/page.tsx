'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Filters, { FilterValues } from '../components/Filters'

interface Business {
  business_slug: string
  location_name: string
  address: string
  airport_code: string
  latitude: number
  longitude: number
  review_count: number
  avg_rating: number
  latest_review_date: string
  has_recommendations: boolean
  after_hours_pct: number
  fbo_delivery_pct: number
  crew_rates_pct: number
  recent_reviews: Array<{
    id: number
    review_text: string
    overall_rating: number
    would_recommend: boolean
    created_at: string
  }>
}

export default function RentalsPage() {
  const [filters, setFilters] = useState<FilterValues>({})
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses?category=rentals')
      if (!response.ok) throw new Error('Failed to fetch car rentals')
      const data = await response.json()
      setBusinesses(data.businesses || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const renderAmenityTags = (business: Business) => {
    const tags = []

    // Only show tag if 50% or more reviews mention it
    if (business.after_hours_pct >= 50) tags.push({ label: 'After-Hours Access', icon: '🌙' })
    if (business.fbo_delivery_pct >= 50) tags.push({ label: 'FBO Delivery', icon: '✈️' })
    if (business.crew_rates_pct >= 50) tags.push({ label: 'Crew Rates', icon: '✓' })

    return (
      <div className="flex flex-wrap gap-2 mt-3 mb-3">
        {tags.map(tag => (
          <span key={tag.label} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            <span>{tag.icon}</span>
            {tag.label}
          </span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Car Rentals</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading car rentals...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Car Rentals</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading car rentals: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Car Rentals</h1>
            <p className="text-gray-600">Find rental car services near airports</p>
          </div>
          <Link
            href="/add?category=rentals"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Review This Rental
          </Link>
        </div>

        <Filters onFilterChange={handleFilterChange} />

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No car rentals reviewed yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {businesses.map((business) => (
              <div key={business.business_slug} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/rentals/${business.business_slug}`}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                        {business.location_name}
                      </h2>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2">{business.address}</p>
                    <p className="text-blue-600 font-semibold">Airport: {business.airport_code}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {business.avg_rating.toFixed(1)}★ ({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})
                    </div>
                    {business.has_recommendations && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        ✓ Recommended
                      </span>
                    )}
                  </div>
                </div>

                {renderAmenityTags(business)}

                {business.recent_reviews && business.recent_reviews.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {business.recent_reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-l-2 border-gray-200 pl-3">
                        <p className="text-gray-700">
                          {review.review_text.length > 150
                            ? `${review.review_text.substring(0, 150)}...`
                            : review.review_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/add?category=rentals&name=${encodeURIComponent(business.location_name)}&address=${encodeURIComponent(business.address)}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Review This Rental
                    </Link>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">Latest review: {new Date(business.latest_review_date).toLocaleDateString()}</span>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500">Amenities reported by crews</p>
                  </div>
                  <Link
                    href={`/rentals/${business.business_slug}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    View All Reviews →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
