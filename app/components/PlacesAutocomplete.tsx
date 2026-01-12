'use client'

import { useEffect, useRef, useState } from 'react'

interface PlaceData {
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceData) => void
  value: string
  category: string
}

export default function PlacesAutocomplete({ onPlaceSelect, value, category }: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [error, setError] = useState<string>('')

  // Sync with external value changes (e.g., form reset)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounce search
  useEffect(() => {
    if (!inputValue || inputValue.length < 3) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      searchPlaces(inputValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [inputValue, category])

  const searchPlaces = async (query: string) => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || !category) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Determine place types
      let type = ''
      if (category === 'hotels') type = 'lodging'
      else if (category === 'restaurants') type = 'restaurant'
      else if (category === 'rentals') type = 'car_rental'

      // Use Text Search (New) API
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.location,places.id'
          },
          body: JSON.stringify({
            textQuery: query,
            locationBias: {
              rectangle: {
                low: { latitude: 24.396308, longitude: -125.000000 },
                high: { latitude: 49.384358, longitude: -66.934570 }
              }
            },
            includedType: type || undefined,
            maxResultCount: 5
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSuggestions(data.places || [])
      setShowDropdown(true)
    } catch (err) {
      setError(`Search failed: ${err}`)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlace = (place: any) => {
    const placeData: PlaceData = {
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber,
      latitude: place.location?.latitude,
      longitude: place.location?.longitude
    }
    
    setInputValue(place.displayName?.text || '')
    onPlaceSelect(placeData)
    setShowDropdown(false)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <label htmlFor="place-search" className="block text-sm font-semibold text-gray-700 mb-2">
        Search for Location *
      </label>
      <input
        ref={inputRef}
        type="text"
        id="place-search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder="Start typing business name or address..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Type the business name (e.g., "Hilton Garden Inn Atlanta") or address
      </p>

      {isLoading && (
        <div className="absolute right-3 top-11 flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 rounded text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={place.id || index}
              type="button"
              onClick={() => handleSelectPlace(place)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-gray-900">
                {place.displayName?.text}
              </div>
              <div className="text-sm text-gray-600">
                {place.formattedAddress}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
