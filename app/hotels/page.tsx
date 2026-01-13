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
  recent_reviews: Array<{
    id: number
    review_text: string
    overall_rating: number
    would_recommend: boolean
    created_at: string
  }>
}

export default function HotelsPage() {
  const [filters, setFilters] = useState<FilterValues>({})
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses?category=hotels')
      if (!response.ok) throw new Error('Failed to fetch hotels')
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Hotels</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading hotels...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Hotels</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading hotels: {error}
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hotels</h1>
            <p className="text-gray-600">Find crew-friendly hotels with the amenities you need</p>
          </div>
          <Link
            href="/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Review
          </Link>
        </div>

        <Filters onFilterChange={handleFilterChange} />

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No hotels listed yet. Be the first to add one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {businesses.map((business) => (
              <div key={business.business_slug} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {business.location_name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">{business.address}</p>
                    <p className="text-blue-600 font-semibold">Airport: {business.airport_code}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(Math.round(business.avg_rating))}
                      <span className="ml-2 text-sm text-gray-600">({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    {business.has_recommendations && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        ✓ Recommended
                      </span>
                    )}
                  </div>
                </div>

                {business.recent_reviews && business.recent_reviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-3">{business.recent_reviews[0].review_text}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/add?category=hotels&name=${encodeURIComponent(business.location_name)}&address=${encodeURIComponent(business.address)}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Review This Hotel
                    </Link>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">Latest review: {new Date(business.latest_review_date).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/hotels/${business.business_slug}`}
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
