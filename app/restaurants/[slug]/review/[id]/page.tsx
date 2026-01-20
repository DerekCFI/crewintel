'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatVisitDateRange } from '../../../../lib/dateFormatting'

interface Review {
  id: number
  category: string
  airport_code: string
  location_name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  overall_rating: number
  calculated_rating: number | null
  review_text: string
  visit_date: string
  visit_date_end: string
  would_recommend: boolean
  created_at: string

  // Restaurant-specific fields
  food_quality: number
  restaurant_service_speed: number
  portion_size: string
  price_point: number
  hours_of_operation: string
  takeout_quality: number
  restaurant_wifi_available: boolean
  atmosphere: string
  restaurant_distance_from_airport: string
  healthy_options: boolean
  vegetarian_options: boolean
  vegan_options: boolean
  gluten_free_options: boolean
}

export default function HotelDetailPage() {
  const params = useParams() as { slug: string; id: string }
  const router = useRouter()
  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchReview()
  }, [params.id])

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Restaurant not found')
        } else {
          throw new Error('Failed to fetch review')
        }
        return
      }
      const data = await response.json()
      setReview(data.review)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-blue-600' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">{rating}</span>
      </div>
    )
  }

  const formatLabel = (value: string) => {
    return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const renderDollarSigns = (count: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(count)].map((_, i) => (
          <span key={i} className="text-2xl text-blue-600">$</span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading review...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Restaurant not found'}
          </div>
          <Link href={`/restaurants/${params.slug}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Restaurant Reviews
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href={`/restaurants/${params.slug}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Restaurant Reviews
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{review.location_name}</h1>
              <p className="text-gray-600 mb-2">{review.address}</p>
              {review.phone && (
                <p className="text-gray-600 mb-2">📞 {review.phone}</p>
              )}
              <p className="text-blue-600 font-semibold">✈️ Airport: {review.airport_code}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-1">Overall Rating</p>
                {renderStars(review.overall_rating)}
              </div>
              {review.calculated_rating && Math.abs(review.overall_rating - review.calculated_rating) >= 0.3 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Detailed Score</p>
                  {renderStars(Math.round(review.calculated_rating))}
                  <p className="text-xs text-gray-500 mt-1">{review.calculated_rating.toFixed(1)}★</p>
                </div>
              )}
              {review.would_recommend && (
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mt-2 inline-block">
                  ✓ Would Recommend
                </span>
              )}
            </div>
          </div>

          {formatVisitDateRange(review.visit_date, review.visit_date_end) && (
            <p className="text-sm text-gray-500">
              Visited: {formatVisitDateRange(review.visit_date, review.visit_date_end)}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Review</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{review.review_text}</p>
          <p className="text-sm text-gray-500 mt-4">
            Reviewed on {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Detailed Ratings */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Ratings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Food Quality */}
            {review.food_quality > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Food Quality</p>
                {renderStars(review.food_quality)}
              </div>
            )}

            {/* Service Speed */}
            {review.restaurant_service_speed > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Service Speed</p>
                {renderStars(review.restaurant_service_speed)}
              </div>
            )}

            {/* Portion Size */}
            {review.portion_size && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Portion Size</p>
                <p className="text-gray-600">{formatLabel(review.portion_size)}</p>
              </div>
            )}

            {/* Price Point */}
            {review.price_point > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Price Point</p>
                {renderDollarSigns(review.price_point)}
              </div>
            )}

            {/* Takeout Quality */}
            {review.takeout_quality > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Takeout Quality</p>
                {renderStars(review.takeout_quality)}
              </div>
            )}

            {/* Hours of Operation */}
            {review.hours_of_operation && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Hours of Operation</p>
                <p className="text-gray-600">{formatLabel(review.hours_of_operation)}</p>
              </div>
            )}

            {/* Atmosphere */}
            {review.atmosphere && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Atmosphere</p>
                <p className="text-gray-600">{formatLabel(review.atmosphere)}</p>
              </div>
            )}

            {/* Distance from Airport */}
            {review.restaurant_distance_from_airport && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Distance from Airport</p>
                <p className="text-gray-600">{formatLabel(review.restaurant_distance_from_airport)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amenities & Services */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dietary Options & Amenities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wi-Fi Available */}
            {review.restaurant_wifi_available && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Wi-Fi Available</p>
              </div>
            )}

            {/* Healthy Options */}
            {review.healthy_options && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Healthy Options Available</p>
              </div>
            )}

            {/* Vegetarian Options */}
            {review.vegetarian_options && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Vegetarian Options Available</p>
              </div>
            )}

            {/* Vegan Options */}
            {review.vegan_options && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Vegan Options Available</p>
              </div>
            )}

            {/* Gluten-Free Options */}
            {review.gluten_free_options && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Gluten-Free Options Available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
