'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddReviewPage({ params }) {
  const router = useRouter()
  const [businessType, setBusinessType] = useState(null)
  const [businessId, setBusinessId] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    overallRating: '',
    reviewText: '',
    // Hotel criteria
    cleanlinessRating: '',
    staffRating: '',
    valueRating: '',
    // FBO criteria
    serviceRating: '',
    facilitiesRating: '',
    // Restaurant criteria
    foodQualityRating: '',
    serviceSpeedRating: '',
    // Car Rental criteria
    vehicleQualityRating: '',
    customerServiceRating: '',
  })

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      setBusinessType(resolvedParams.businessType)
      setBusinessId(resolvedParams.businessId)
      
      // Fetch the business details
      try {
        const response = await fetch(`/api/${resolvedParams.businessType}s/${resolvedParams.businessId}`)
        if (response.ok) {
          const data = await response.json()
          setBusiness(data)
        }
      } catch (error) {
        console.error('Error loading business:', error)
      }
      setLoading(false)
    }
    loadParams()
  }, [params])

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star.toString())}
            onMouseEnter={(e) => {
              const buttons = e.currentTarget.parentElement.querySelectorAll('button');
              buttons.forEach((btn, idx) => {
                if (idx < star) {
                  btn.style.color = '#93c5fd';
                } else {
                  btn.style.color = value && parseFloat(value) > idx ? '#2563eb' : '#d1d5db';
                }
              });
            }}
            onMouseLeave={(e) => {
              const buttons = e.currentTarget.parentElement.querySelectorAll('button');
              buttons.forEach((btn, idx) => {
                btn.style.color = value && parseFloat(value) > idx ? '#2563eb' : '#d1d5db';
              });
            }}
            className="text-3xl transition-colors"
            style={{ color: value && parseFloat(value) >= star ? '#2563eb' : '#d1d5db' }}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-gray-600 self-center">({value || '0'}/5)</span>
      </div>
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate that overall rating is set
    if (!formData.overallRating) {
      alert('Please select an overall rating')
      return
    }
    
    setSubmitting(true)
    
    const review = {
      businessType,
      businessId,
      businessName: business?.name,
      overallRating: parseFloat(formData.overallRating),
      reviewText: formData.reviewText,
      createdAt: new Date().toISOString()
    }
    
    // Add category-specific ratings
    if (businessType === 'hotel') {
      review.cleanlinessRating = parseFloat(formData.cleanlinessRating) || 5
      review.staffRating = parseFloat(formData.staffRating) || 5
      review.valueRating = parseFloat(formData.valueRating) || 5
    } else if (businessType === 'fbo') {
      review.serviceRating = parseFloat(formData.serviceRating) || 5
      review.facilitiesRating = parseFloat(formData.facilitiesRating) || 5
    } else if (businessType === 'restaurant') {
      review.foodQualityRating = parseFloat(formData.foodQualityRating) || 5
      review.serviceSpeedRating = parseFloat(formData.serviceSpeedRating) || 5
    } else if (businessType === 'rental') {
      review.vehicleQualityRating = parseFloat(formData.vehicleQualityRating) || 5
      review.customerServiceRating = parseFloat(formData.customerServiceRating) || 5
    }
    
    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      })
      
      if (response.ok) {
        // Postgres is instant - no wait needed!
        window.location.href = `/${businessType}s/${businessId}`
      }
       else {
        alert('Error submitting review')
        setSubmitting(false)
      }
    } catch (error) {
      alert('Error: ' + error.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Go Home</Link>
        </div>
      </main>
    )
  }

  // Loading overlay when submitting
  if (submitting) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Saving Your Review...</h2>
            <p className="text-gray-600">Please wait while we save your feedback</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${businessType}s/${businessId}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to {business.name}
        </Link>
        
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Leave a Review</h1>
        <p className="text-xl text-gray-600 mb-8">{business.name}</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <StarRating 
            value={formData.overallRating}
            onChange={(val) => setFormData({...formData, overallRating: val})}
            label="Overall Rating *"
          />

          {/* Hotel-specific ratings */}
          {businessType === 'hotel' && (
            <>
              <StarRating 
                value={formData.cleanlinessRating}
                onChange={(val) => setFormData({...formData, cleanlinessRating: val})}
                label="Cleanliness Rating"
              />
              <StarRating 
                value={formData.staffRating}
                onChange={(val) => setFormData({...formData, staffRating: val})}
                label="Staff Rating"
              />
              <StarRating 
                value={formData.valueRating}
                onChange={(val) => setFormData({...formData, valueRating: val})}
                label="Value Rating"
              />
            </>
          )}

          {/* FBO-specific ratings */}
          {businessType === 'fbo' && (
            <>
              <StarRating 
                value={formData.serviceRating}
                onChange={(val) => setFormData({...formData, serviceRating: val})}
                label="Service Rating"
              />
              <StarRating 
                value={formData.facilitiesRating}
                onChange={(val) => setFormData({...formData, facilitiesRating: val})}
                label="Facilities Rating"
              />
            </>
          )}

          {/* Restaurant-specific ratings */}
          {businessType === 'restaurant' && (
            <>
              <StarRating 
                value={formData.foodQualityRating}
                onChange={(val) => setFormData({...formData, foodQualityRating: val})}
                label="Food Quality Rating"
              />
              <StarRating 
                value={formData.serviceSpeedRating}
                onChange={(val) => setFormData({...formData, serviceSpeedRating: val})}
                label="Service Speed Rating"
              />
            </>
          )}

          {/* Car Rental-specific ratings */}
          {businessType === 'rental' && (
            <>
              <StarRating 
                value={formData.vehicleQualityRating}
                onChange={(val) => setFormData({...formData, vehicleQualityRating: val})}
                label="Vehicle Quality Rating"
              />
              <StarRating 
                value={formData.customerServiceRating}
                onChange={(val) => setFormData({...formData, customerServiceRating: val})}
                label="Customer Service Rating"
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Your Review *</label>
            <textarea
              required
              rows="6"
              className="w-full border rounded p-2"
              placeholder="Share your experience with fellow crew members..."
              value={formData.reviewText}
              onChange={(e) => setFormData({...formData, reviewText: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700"
          >
            Submit Review
          </button>
        </form>
      </div>
    </main>
  )
}
