'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Review {
  id: number
  category: string
  location_name: string
  business_slug: string
  address: string
  airport_code: string | null
  overall_rating: number
  review_text: string | null
  status: 'draft' | 'published'
  is_quick_log: boolean
  created_at: string
  updated_at: string
}

const categoryConfig: Record<string, { icon: string; label: string }> = {
  hotels: { icon: '🏨', label: 'Hotel' },
  fbos: { icon: '✈️', label: 'FBO' },
  restaurants: { icon: '🍽️', label: 'Restaurant' },
  rentals: { icon: '🚗', label: 'Car Rental' }
}

export default function MyReviewsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/user/reviews')
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        setReviews(data.reviews || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load your reviews. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReviews()
    }
  }, [user, isLoaded, router])

  const [submitting, setSubmitting] = useState<number | null>(null)

  const drafts = reviews.filter(r => r.status === 'draft')
  const published = reviews.filter(r => r.status === 'published')

  const submitDraftNow = async (reviewId: number) => {
    setSubmitting(reviewId)
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' })
      })

      if (!response.ok) {
        throw new Error('Failed to publish review')
      }

      // Update the local state to move the review from drafts to published
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId ? { ...r, status: 'published' as const } : r
        )
      )
    } catch (err) {
      console.error('Error publishing review:', err)
      alert('Failed to publish review. Please try again.')
    } finally {
      setSubmitting(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-brand-orange' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  const ReviewCard = ({ review }: { review: Review }) => {
    const config = categoryConfig[review.category] || { icon: '📝', label: review.category }
    const isDraft = review.status === 'draft'

    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{config.icon}</span>
            <span className="text-sm text-gray-500">{config.label}</span>
            {isDraft && (
              <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded">
                DRAFT
              </span>
            )}
            {review.is_quick_log && (
              <span className="bg-brand-blue/10 text-brand-blue text-xs font-medium px-2 py-0.5 rounded">
                Quick Log
              </span>
            )}
          </div>
          {renderStars(review.overall_rating)}
        </div>

        <h3 className="font-semibold text-brand-navy mb-1">{review.location_name}</h3>

        {review.airport_code && (
          <p className="text-sm text-gray-500 mb-1">Near {review.airport_code}</p>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-1">{review.address}</p>

        {review.review_text && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            &ldquo;{review.review_text}&rdquo;
          </p>
        )}

        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-500">
            {new Date(review.updated_at || review.created_at).toLocaleDateString()}
          </span>

          <div className="flex gap-2">
            {isDraft ? (
              <>
                <Link
                  href={`/add?draft=${review.id}`}
                  className="bg-brand-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-navy/90 min-h-[36px] flex items-center"
                >
                  Finish Review
                </Link>
                <button
                  onClick={() => submitDraftNow(review.id)}
                  disabled={submitting === review.id}
                  className="bg-brand-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-orange/90 min-h-[36px] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting === review.id ? 'Publishing...' : 'Submit Now'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${review.category}/${review.business_slug}`}
                  className="text-brand-blue hover:text-brand-blue/80 font-medium"
                >
                  View
                </Link>
                <Link
                  href={`/add?draft=${review.id}`}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Edit
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-navy text-white px-6 py-2 rounded-lg hover:bg-brand-navy/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-brand-navy">My Reviews</h1>
          <Link
            href="/quick-log"
            className="bg-brand-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-orange/90 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Log
          </Link>
        </div>

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center gap-2">
              <span className="bg-brand-orange text-white text-sm px-2 py-0.5 rounded">
                {drafts.length}
              </span>
              Drafts
            </h2>
            <div className="space-y-4">
              {drafts.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Published Section */}
        <div>
          <h2 className="text-xl font-semibold text-brand-navy mb-4">
            Published Reviews ({published.length})
          </h2>
          {published.length === 0 && drafts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-gray-600 mb-6">You haven&apos;t submitted any reviews yet.</p>
              <Link
                href="/quick-log"
                className="inline-block bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-orange/90"
              >
                Create Your First Review
              </Link>
            </div>
          ) : published.length === 0 ? (
            <p className="text-gray-500">No published reviews yet. Finish your drafts to publish them!</p>
          ) : (
            <div className="space-y-4">
              {published.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
