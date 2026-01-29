'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatVisitDateRange } from '../../../../../lib/dateFormatting'
import PhotoGallery, { Photo } from '../../../../../components/PhotoGallery'

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
  is_quick_log?: boolean
  visit_date: string
  visit_date_end: string
  would_recommend: boolean
  created_at: string

  // Hotel-specific fields
  bed_quality: number
  noise_level: string
  blackout_curtains: boolean
  blackout_effectiveness: number
  room_cleanliness: number
  checkin_experience: number
  staff_responsiveness: string
  wifi_quality: number
  shower_quality: number
  room_temperature_control: string
  parking_situation: string
  breakfast: string
  breakfast_start_time: string
  crew_recognition: boolean
  laundry_available: string
  dry_cleaning_available: boolean
  fitness_center: boolean
  shuttle_service: boolean
  distance_from_airport: string
  room_location_recommendation: string
  distance_to_restaurants: string
  in_room_coffee: string
  in_room_microwave: boolean
}

export default function HotelDetailPage() {
  const params = useParams() as { slug: string; id: string }
  const router = useRouter()
  const [review, setReview] = useState<Review | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
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
          setError('Hotel not found')
        } else {
          throw new Error('Failed to fetch review')
        }
        return
      }
      const data = await response.json()
      setReview(data.review)
      if (data.photos) {
        setPhotos(data.photos.map((p: any) => ({
          id: p.id,
          url: p.cloudinary_url,
          thumbnailUrl: p.thumbnail_url,
          width: p.width,
          height: p.height
        })))
      }
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
            className={`w-5 h-5 ${i < rating ? 'text-brand-orange' : 'text-gray-300'}`}
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

  const formatBreakfast = (value: string) => {
    const breakfastLabels: { [key: string]: string } = {
      'included': 'Breakfast: Included in room rate',
      'purchase': 'Breakfast: Available for purchase',
      'complimentary-continental': 'Breakfast: Complimentary continental',
      'not-available': 'Breakfast: Not available'
    }
    return breakfastLabels[value] || `Breakfast: ${formatLabel(value)}`
  }

  const formatLaundry = (value: string) => {
    const laundryLabels: { [key: string]: string } = {
      'in-room': 'Self-Service Laundry: In-Room',
      'free-on-site': 'Self-Service Laundry: Free On-Site',
      'paid-on-site': 'Self-Service Laundry: Paid On-Site',
      'nearby': 'Self-Service Laundry: Nearby',
      'none': 'Self-Service Laundry: Not available'
    }
    return laundryLabels[value] || `Self-Service Laundry: ${formatLabel(value)}`
  }

  const formatCoffee = (value: string) => {
    const coffeeLabels: { [key: string]: string } = {
      'single-cup': 'In-Room Coffee: Single-cup machine (Keurig-style)',
      'multi-cup': 'In-Room Coffee: Multi-cup machine (standard coffee maker)',
      'none': 'In-Room Coffee: Not available'
    }
    return coffeeLabels[value] || `In-Room Coffee: ${formatLabel(value)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></div>
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
            {error || 'Hotel not found'}
          </div>
          <Link href={`/hotels/${params.slug}`} className="text-brand-blue hover:text-brand-blue/80">
            ← Back to Hotel Reviews
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href={`/hotels/${params.slug}`} className="text-brand-blue hover:text-brand-blue/80 mb-4 inline-block">
          ← Back to Hotel Reviews
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-navy mb-2">{review.location_name}</h1>
              <p className="text-gray-600 mb-2">{review.address}</p>
              {review.phone && (
                <p className="text-gray-600 mb-2">📞 {review.phone}</p>
              )}
              <p className="text-brand-orange font-semibold">✈️ Airport: {review.airport_code}</p>
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
          <h2 className="text-2xl font-bold text-brand-navy mb-4">Review</h2>
          {review.is_quick_log && (!review.review_text || review.review_text.trim().length < 10) ? (
            <p className="text-gray-500 italic">
              Added via Quick Log - come back later to see more details!
            </p>
          ) : (
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{review.review_text}</p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Reviewed on {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Photos</h2>
            <PhotoGallery photos={photos} businessName={review.location_name} variant="grid" />
          </div>
        )}

        {/* Detailed Ratings */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Detailed Ratings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bed Quality */}
            {review.bed_quality > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Bed/Sleep Quality</p>
                {renderStars(review.bed_quality)}
              </div>
            )}

            {/* Room Cleanliness */}
            {review.room_cleanliness > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Room Cleanliness</p>
                {renderStars(review.room_cleanliness)}
              </div>
            )}

            {/* Check-in Experience */}
            {review.checkin_experience > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Check-In Experience</p>
                {renderStars(review.checkin_experience)}
              </div>
            )}

            {/* Wi-Fi Quality */}
            {review.wifi_quality > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Wi-Fi Quality</p>
                {renderStars(review.wifi_quality)}
              </div>
            )}

            {/* Shower Quality */}
            {review.shower_quality > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Shower Quality</p>
                {renderStars(review.shower_quality)}
              </div>
            )}

            {/* Blackout Effectiveness */}
            {review.blackout_curtains && review.blackout_effectiveness > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Blackout Curtain Effectiveness</p>
                {renderStars(review.blackout_effectiveness)}
              </div>
            )}

            {/* Noise Level */}
            {review.noise_level && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Noise Level</p>
                <p className="text-gray-600">{formatLabel(review.noise_level)}</p>
              </div>
            )}

            {/* Room Temperature Control */}
            {review.room_temperature_control && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Room Temperature Control</p>
                <p className="text-gray-600">{formatLabel(review.room_temperature_control)}</p>
              </div>
            )}

            {/* Staff Responsiveness */}
            {review.staff_responsiveness && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Staff Responsiveness</p>
                <p className="text-gray-600">{formatLabel(review.staff_responsiveness)}</p>
              </div>
            )}

            {/* Parking */}
            {review.parking_situation && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Parking Situation</p>
                <p className="text-gray-600">{formatLabel(review.parking_situation)}</p>
              </div>
            )}

            {/* Distance from Airport */}
            {review.distance_from_airport && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Distance from Airport</p>
                <p className="text-gray-600">{formatLabel(review.distance_from_airport)}</p>
              </div>
            )}

            {/* Distance to Restaurants */}
            {review.distance_to_restaurants && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Distance to Restaurants</p>
                <p className="text-gray-600">{formatLabel(review.distance_to_restaurants)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amenities & Services */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Amenities & Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            {review.breakfast && review.breakfast !== 'not-available' && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">Breakfast</p>
                  <p className="text-sm">
                    <span className="italic text-gray-600">
                      {review.breakfast === 'included' && 'Included in room rate'}
                      {review.breakfast === 'purchase' && 'Available for purchase'}
                      {review.breakfast === 'complimentary-continental' && 'Complimentary continental'}
                      {!['included', 'purchase', 'complimentary-continental'].includes(review.breakfast) && formatLabel(review.breakfast)}
                    </span>
                  </p>
                  {review.breakfast_start_time && (
                    <p className="text-sm text-gray-500 mt-1">Start Time: {review.breakfast_start_time}</p>
                  )}
                </div>
              </div>
            )}

            {/* In-Room Coffee */}
            {review.in_room_coffee && review.in_room_coffee !== 'none' && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">In-Room Coffee</p>
                  <p className="text-sm">
                    <span className="italic text-gray-600">
                      {review.in_room_coffee === 'single-cup' && 'Single-cup machine (Keurig-style)'}
                      {review.in_room_coffee === 'multi-cup' && 'Multi-cup machine (standard coffee maker)'}
                      {!['single-cup', 'multi-cup'].includes(review.in_room_coffee) && formatLabel(review.in_room_coffee)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* In-Room Microwave */}
            {review.in_room_microwave && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">In-Room Microwave</p>
              </div>
            )}

            {/* Laundry */}
            {review.laundry_available && review.laundry_available !== 'none' && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-700">Self-Service Laundry</p>
                  <p className="text-sm">
                    <span className="italic text-gray-600">
                      {review.laundry_available === 'in-room' && 'In-Room'}
                      {review.laundry_available === 'free-on-site' && 'Free On-Site'}
                      {review.laundry_available === 'paid-on-site' && 'Paid On-Site'}
                      {review.laundry_available === 'nearby' && 'Nearby'}
                      {!['in-room', 'free-on-site', 'paid-on-site', 'nearby'].includes(review.laundry_available) && formatLabel(review.laundry_available)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Dry Cleaning */}
            {review.dry_cleaning_available && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Dry Cleaning Available</p>
              </div>
            )}

            {/* Fitness Center */}
            {review.fitness_center && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Fitness Center</p>
              </div>
            )}

            {/* Shuttle Service */}
            {review.shuttle_service && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Shuttle Service</p>
              </div>
            )}

            {/* Crew Recognition */}
            {review.crew_recognition && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Crew Recognition/Rates</p>
              </div>
            )}

            {/* Blackout Curtains */}
            {review.blackout_curtains && (
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="font-semibold text-gray-700">Blackout Curtains</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Tips */}
        {review.room_location_recommendation && (
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-brand-navy mb-2">💡 Room Location Tips</h3>
            <p className="text-gray-700">{review.room_location_recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}
