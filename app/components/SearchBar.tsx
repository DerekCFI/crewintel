'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Airport {
  iata: string
  icao: string
  name: string
  city: string
  state: string
}

interface SearchBarProps {
  variant?: 'header' | 'homepage'
  onClose?: () => void
}

export default function SearchBar({ variant = 'homepage', onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Airport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        if (variant === 'header' && onClose) {
          onClose()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [variant, onClose])

  // Search airports as user types
  useEffect(() => {
    const searchAirports = async () => {
      if (query.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/airports?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.airports || [])
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchAirports, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelectAirport = (airport: Airport) => {
    router.push(`/search?airport=${airport.iata}`)
    setQuery('')
    setShowResults(false)
    if (onClose) onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false)
      if (variant === 'header' && onClose) {
        onClose()
      }
    }
  }

  const isHeader = variant === 'header'

  return (
    <div ref={searchRef} className={`relative ${isHeader ? 'w-full' : ''}`}>
      {!isHeader && (
        <div className="mb-4 text-center">
          <p className="text-gray-600 text-sm md:text-base">
            Search by airport code (IATA or ICAO) to find crew-reviewed hotels, FBOs, restaurants, and services nearby
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Examples: ATL, KATL, or Atlanta
          </p>
        </div>
      )}

      <div className={`relative ${isHeader ? '' : 'max-w-2xl mx-auto'}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isHeader ? "Search airports..." : "Try ATL, KATL, or Atlanta..."}
          className={`w-full px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
            isHeader ? 'py-2 text-sm' : 'py-4 text-lg'
          }`}
          autoFocus={isHeader}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Autocomplete dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((airport) => (
              <button
                key={airport.iata}
                onClick={() => handleSelectAirport(airport)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {airport.iata} / {airport.icao}
                    </div>
                    <div className="text-sm text-gray-600">
                      {airport.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {airport.city}, {airport.state}
                    </div>
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No airports found matching "{query}"
          </div>
        )}
      </div>
    </div>
  )
}
