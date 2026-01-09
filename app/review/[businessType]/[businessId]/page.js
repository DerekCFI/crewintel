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
  
  const [formData, setFormData] = useState({
    overallRating: 5,
    reviewText: '',
    // Hotel criteria
    cleanlinessRating: 5,
    staffRating: 5,
    valueRating: 5,
    // FBO criteria
    serviceRating: 5,
    facilitiesRating: 5,
    // Restaurant criteria
    foodQualityRating: 5,
    serviceSpeedRating: 5,
    // Car Rental criteria
    vehicleQualityRating: 5,
    customerServiceRating: 5,

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const review = {
      businessType,
      businessId,
      businessName: business?.name,
      ...formData,
      createdAt: new Date().toISOString()
    }
    
    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      })
      
      if (response.ok) {
        alert('Review submitted successfully!')
        router.push(`/${businessType}s/${businessId}`)
      } else {
        alert('Error submitting review')
      }
    } catch (error) {
      alert('Error: ' + error.message)
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

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${businessType}s/${businessId}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to {business.name}
        </Link>
        
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Leave a Review</h1>
        <p className="text-xl text-gray-600 mb-8">{business.name}</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Overall Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              required
              className="w-full border rounded p-2"
              value={formData.overallRating}
              onChange={(e) => setFormData({...formData, overallRating: parseFloat(e.target.value)})}
            />
          </div>

          {/* Hotel-specific ratings */}
          {businessType === 'hotel' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Cleanliness Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.cleanlinessRating}
                  onChange={(e) => setFormData({...formData, cleanlinessRating: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Staff Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.staffRating}
                  onChange={(e) => setFormData({...formData, staffRating: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Value Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.valueRating}
                  onChange={(e) => setFormData({...formData, valueRating: parseFloat(e.target.value)})}
                />
              </div>
            </>
          )}

          {/* FBO-specific ratings */}
          {businessType === 'fbo' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Service Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.serviceRating}
                  onChange={(e) => setFormData({...formData, serviceRating: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Facilities Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.facilitiesRating}
                  onChange={(e) => setFormData({...formData, facilitiesRating: parseFloat(e.target.value)})}
                />
              </div>
            </>
          )}

          {/* Restaurant-specific ratings */}
          {businessType === 'restaurant' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Food Quality Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.foodQualityRating}
                  onChange={(e) => setFormData({...formData, foodQualityRating: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Speed Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.serviceSpeedRating}
                  onChange={(e) => setFormData({...formData, serviceSpeedRating: parseFloat(e.target.value)})}
                />
              </div>
            </>
          )}

          {/* Car Rental-specific ratings */}
          {businessType === 'rental' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Quality Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.vehicleQualityRating}
                  onChange={(e) => setFormData({...formData, vehicleQualityRating: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Customer Service Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  className="w-full border rounded p-2"
                  value={formData.customerServiceRating}
                  onChange={(e) => setFormData({...formData, customerServiceRating: parseFloat(e.target.value)})}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
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
