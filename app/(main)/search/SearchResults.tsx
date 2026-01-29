'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Airport {
  iata: string
  icao: string
  name: string
  city: string
  state: string
}

interface Review {
  id: number
  category: string
  business_slug: string
  location_name: string
  overall_rating: number
  review_text: string
  created_at: string
  distance_from_airport: number
  is_quick_log?: boolean
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  hotels: { label: 'Hotel', icon: '🏨', color: 'bg-brand-navy/10 text-brand-navy' },
  fbos: { label: 'FBO', icon: '✈️', color: 'bg-purple-100 text-purple-800' },
  restaurants: { label: 'Restaurant', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  rentals: { label: 'Car Rental', icon: '🚗', color: 'bg-green-100 text-green-800' }
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const airportQuery = searchParams.get('airport')
  const [airport, setAirport] = useState<Airport | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchAirport = async () => {
      if (!airportQuery) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search/airports?q=${encodeURIComponent(airportQuery)}`)
        const data = await response.json()

        if (data.airports && data.airports.length > 0) {
          setAirport(data.airports[0])
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching airport:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAirport()
  }, [airportQuery])

  useEffect(() => {
    const fetchNearbyReviews = async () => {
      if (!airport) return

      setReviewsLoading(true)
      try {
        const response = await fetch(`/api/search/nearby-reviews?airport=${airport.icao}&radius=30`)
        const data = await response.json()

        if (data.reviews) {
          setReviews(data.reviews)
        }
      } catch (err) {
        console.error('Error fetching nearby reviews:', err)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchNearbyReviews()
  }, [airport])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-brand-orange' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-brand-navy border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !airport) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-navy mb-4">Airport Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find an airport matching "{airportQuery}"
          </p>
          <Link 
            href="/" 
            className="bg-brand-navy text-white px-6 py-3 rounded-lg hover:bg-brand-navy/90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Airport Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-navy mb-2">
                {airport.iata} / {airport.icao}
              </h1>
              <h2 className="text-xl text-gray-700 mb-1">{airport.name}</h2>
              <p className="text-gray-600">{airport.city}, {airport.state}</p>
            </div>
            <Link
              href={`/quick-log?airport=${airport.iata}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-lg font-semibold hover:bg-brand-orange/90 transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Quick Log at {airport.iata}
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
            href={`/hotels?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Hotels</h3>
            <p className="text-gray-600 text-sm">Find crew-friendly hotels near {airport.iata}</p>
          </Link>

          <Link 
            href={`/fbos?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-brand-navy mb-2">FBOs</h3>
            <p className="text-gray-600 text-sm">Browse FBO services at {airport.iata}</p>
          </Link>

          <Link 
            href={`/rentals?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Car Rentals</h3>
            <p className="text-gray-600 text-sm">Find rental cars near {airport.iata}</p>
          </Link>

          <Link 
            href={`/restaurants?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Restaurants</h3>
            <p className="text-gray-600 text-sm">Discover restaurants near {airport.iata}</p>
          </Link>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-brand-navy mb-4">Recent Reviews</h3>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet for hotels, FBOs, car rentals, or restaurants near {airport.iata}. Be the first to share your crew experience!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const config = categoryConfig[review.category] || { label: review.category, icon: '📝', color: 'bg-gray-100 text-gray-800' }
                return (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded ${config.color}`}>
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {review.distance_from_airport} miles away
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center">
                          {renderStars(Math.round(review.overall_rating))}
                        </div>
                        {review.is_quick_log && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            ⚡ Quick Log
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-semibold text-brand-navy mb-1">{review.location_name}</h4>

                    {review.is_quick_log && (!review.review_text || review.review_text.trim().length < 10) ? (
                      <p className="text-gray-500 text-sm mb-3 italic">
                        Added via Quick Log - come back later to see more details!
                      </p>
                    ) : (
                      <p className="text-gray-700 text-sm mb-3">
                        &quot;{review.review_text.substring(0, 150)}{review.review_text.length > 150 ? '...' : ''}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/${review.category}/${review.business_slug}`}
                        className="text-brand-blue hover:text-brand-blue/80 font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
