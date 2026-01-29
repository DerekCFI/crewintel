'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import PlacesAutocomplete from './PlacesAutocomplete'
import StarRating from './StarRating'
import ToggleSwitch from './ToggleSwitch'

interface QuickLogFormData {
  category: string
  locationName: string
  address: string
  phone: string
  latitude: number | null
  longitude: number | null
  airportCode: string
  overallRating: number
  crewFriendly: boolean | null
  wouldReturn: boolean | null
  recommend: boolean | null
}

const STORAGE_KEY_PREFIX = 'quicklog-draft'
const AUTO_SAVE_INTERVAL = 30000

const categories = [
  { id: 'hotels', label: 'Hotel', icon: '🏨' },
  { id: 'fbos', label: 'FBO', icon: '✈️' },
  { id: 'restaurants', label: 'Restaurant', icon: '🍽️' },
  { id: 'rentals', label: 'Car Rental', icon: '🚗' }
]

const initialFormData: QuickLogFormData = {
  category: '',
  locationName: '',
  address: '',
  phone: '',
  latitude: null,
  longitude: null,
  airportCode: '',
  overallRating: 0,
  crewFriendly: null,
  wouldReturn: null,
  recommend: null
}

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

interface QuickLogFormProps {
  initialAirport?: string
}

export default function QuickLogForm({ initialAirport = '' }: QuickLogFormProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<QuickLogFormData>({
    ...initialFormData,
    airportCode: initialAirport || searchParams.get('airport') || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  const [savedDraft, setSavedDraft] = useState<QuickLogFormData | null>(null)

  // Load saved draft on mount
  useEffect(() => {
    if (!user?.id) return

    try {
      const stored = localStorage.getItem(getStorageKey(user.id))
      if (stored) {
        const draft = JSON.parse(stored)
        // Check if draft has meaningful data
        if (draft.locationName || draft.category) {
          setSavedDraft(draft)
          setShowRestorePrompt(true)
        }
      }
    } catch (err) {
      console.error('Failed to load draft:', err)
    }
  }, [user?.id])

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!user?.id) return

    const timer = setTimeout(() => {
      // Only save if form has meaningful data
      if (formData.locationName || formData.category) {
        try {
          localStorage.setItem(
            getStorageKey(user.id),
            JSON.stringify(formData)
          )
        } catch (err) {
          console.error('Failed to save draft:', err)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData, user?.id])

  // Auto-save on interval
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      if (formData.locationName || formData.category) {
        try {
          localStorage.setItem(
            getStorageKey(user.id),
            JSON.stringify(formData)
          )
        } catch (err) {
          console.error('Failed to save draft:', err)
        }
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [formData, user?.id])

  const clearLocalDraft = useCallback(() => {
    if (!user?.id) return
    try {
      localStorage.removeItem(getStorageKey(user.id))
    } catch (err) {
      console.error('Failed to clear draft:', err)
    }
  }, [user?.id])

  const handleRestoreDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft)
    }
    setShowRestorePrompt(false)
    setSavedDraft(null)
  }

  const handleDiscardDraft = () => {
    clearLocalDraft()
    setShowRestorePrompt(false)
    setSavedDraft(null)
  }

  const handlePlaceSelect = (place: { name: string; address: string; phone?: string; latitude?: number; longitude?: number }) => {
    setFormData(prev => ({
      ...prev,
      locationName: place.name,
      address: place.address,
      phone: place.phone || '',
      latitude: place.latitude || null,
      longitude: place.longitude || null
    }))
  }

  const handleSubmit = async (action: 'draft' | 'publish') => {
    setError('')

    // Validate required fields
    if (!formData.category) {
      setError('Please select a category')
      return
    }
    if (!formData.locationName) {
      setError('Please search and select a location')
      return
    }
    if (formData.overallRating === 0) {
      setError('Please rate the location')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          category: formData.category,
          locationName: formData.locationName,
          address: formData.address,
          phone: formData.phone || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          airportCode: formData.airportCode || null,
          overallRating: formData.overallRating,
          crewFriendly: formData.crewFriendly,
          wouldReturn: formData.wouldReturn,
          wouldRecommend: formData.recommend
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Clear local draft on success
      clearLocalDraft()

      // Navigate based on action
      if (action === 'draft') {
        router.push('/my-reviews')
      } else {
        router.push(`/${formData.category}/${data.businessSlug || ''}?success=true`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Restore Prompt */}
      {showRestorePrompt && (
        <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-lg p-4">
          <p className="text-sm text-brand-navy mb-3">
            You have unsaved changes. Would you like to restore them?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="flex-1 bg-brand-blue text-white py-2 px-4 rounded-lg font-medium min-h-[44px]"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium min-h-[44px]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Category *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
              className={`min-h-[56px] rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-1 ${
                formData.category === cat.id
                  ? 'border-brand-orange bg-brand-orange/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-sm text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Search */}
      {formData.category && (
        <PlacesAutocomplete
          onPlaceSelect={handlePlaceSelect}
          value={formData.locationName}
          category={formData.category}
        />
      )}

      {/* Show selected location details */}
      {formData.locationName && formData.address && (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-brand-navy">Selected Location:</p>
          <p className="text-sm text-gray-700">{formData.locationName}</p>
          <p className="text-xs text-gray-500 mt-1">{formData.address}</p>
        </div>
      )}

      {/* Airport Code (Optional) */}
      {formData.locationName && (
        <div>
          <label htmlFor="airport-code" className="block text-sm font-semibold text-gray-700 mb-2">
            Airport Code (Optional)
          </label>
          <input
            type="text"
            id="airport-code"
            value={formData.airportCode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              airportCode: e.target.value.toUpperCase().slice(0, 4)
            }))}
            placeholder="e.g., ATL or KATL"
            maxLength={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy uppercase min-h-[44px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            IATA (3 letters) or ICAO (4 letters) code
          </p>
        </div>
      )}

      {/* Overall Rating */}
      {formData.locationName && (
        <div className="pt-2">
          <StarRating
            value={formData.overallRating}
            onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
            label="Overall Rating"
            required
          />
        </div>
      )}

      {/* Quick Toggles */}
      {formData.overallRating > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Questions (Optional)</h3>
          <ToggleSwitch
            label="Crew-friendly?"
            value={formData.crewFriendly}
            onChange={(value) => setFormData(prev => ({ ...prev, crewFriendly: value }))}
          />
          <ToggleSwitch
            label="Would return?"
            value={formData.wouldReturn}
            onChange={(value) => setFormData(prev => ({ ...prev, wouldReturn: value }))}
          />
          <ToggleSwitch
            label="Recommend to others?"
            value={formData.recommend}
            onChange={(value) => setFormData(prev => ({ ...prev, recommend: value }))}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      {formData.overallRating > 0 && (
        <div className="sticky bottom-4 pt-4 pb-safe">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold min-h-[56px] hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('publish')}
              disabled={isSubmitting}
              className="flex-1 bg-brand-orange text-white py-4 px-6 rounded-lg font-semibold min-h-[56px] hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
