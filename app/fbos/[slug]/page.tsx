'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatVisitDateRange } from '../../lib/dateFormatting'
import PhotoGallery, { Photo } from '../../components/PhotoGallery'

interface Review {
  id: number
  overall_rating: number
  review_text: string
  would_recommend: boolean
  created_at: string
  visit_date: string
  visit_date_end: string
  photo_count: number
}

interface Business {
  business_slug: string
  location_name: string
  address: string
  phone: string
  airport_code: string
  latitude: number
  longitude: number
  review_count: number
  avg_rating: number
  crew_car_pct: number
  catering_pct: number
  hangar_pct: number
  twentyfour_seven_pct: number
}

export default function BusinessPage() {
  const params = useParams() as { slug: string }
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchBusinessData()
  }, [params.slug])

  const fetchBusinessData = async () => {
    try {
      const response = await fetch(`/api/businesses/${params.slug}?category=fbos`)
      if (!response.ok) throw new Error('Business not found')

      const data = await response.json()
      setBusiness(data.business)
      setReviews(data.reviews)
      setPhotos(data.photos || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
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

  const renderAmenityTags = (business: Business) => {
    const tags = []

    // Only show tag if 50% or more reviews mention it
    if (business.crew_car_pct >= 50) tags.push({ label: 'Crew Car', icon: '🚗' })
    if (business.catering_pct >= 50) tags.push({ label: 'Catering', icon: '🍽️' })
    if (business.hangar_pct >= 50) tags.push({ label: 'Hangar', icon: '🏢' })
    if (business.twentyfour_seven_pct >= 50) tags.push({ label: '24/7 Service', icon: '🕐' })

    return tags
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Business not found'}
          </div>
          <Link href="/fbos" className="text-blue-600 hover:text-blue-800">
            ← Back to FBOs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/fbos" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to FBOs
        </Link>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{business.location_name}</h1>
              <p className="text-gray-600 mb-2">{business.address}</p>
              {business.phone && <p className="text-gray-600 mb-2">📞 {business.phone}</p>}
              <p className="text-blue-600 font-semibold">✈️ Airport: {business.airport_code}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">{business.avg_rating}</span>
                <div className="flex">{renderStars(Math.round(business.avg_rating))}</div>
              </div>
              <p className="text-gray-600 text-sm">{business.review_count} review{business.review_count !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <Link
            href={`/add?category=fbos&name=${encodeURIComponent(business.location_name)}&address=${encodeURIComponent(business.address)}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Review This FBO
          </Link>
        </div>

        {/* Photos Section */}
        {photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
            <PhotoGallery
              photos={photos}
              businessName={business.location_name}
              maxDisplay={6}
              variant={photos.length >= 5 ? 'hero' : 'grid'}
            />
          </div>
        )}

        {/* Amenities Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {renderAmenityTags(business).map(tag => (
              <span key={tag.label} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                <span>{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>

          <div className="flex justify-end">
            <p className="text-xs text-gray-500 italic">
              Amenities reported by at least 50% of crews ({business.review_count} review{business.review_count !== 1 ? 's' : ''})
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>

          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(review.overall_rating)}
                  <span className="font-semibold text-gray-900">{review.overall_rating}</span>
                </div>
                {review.would_recommend && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ Recommended
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-4">{review.review_text}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div>
                    {formatVisitDateRange(review.visit_date, review.visit_date_end) && (
                      <span>Visited: {formatVisitDateRange(review.visit_date, review.visit_date_end)} • </span>
                    )}
                    <span>Reviewed: {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.photo_count > 0 && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {review.photo_count}
                    </span>
                  )}
                </div>
                <Link
                  href={`/fbos/${params.slug}/review/${review.id}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View Full Review →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
