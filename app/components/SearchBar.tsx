'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  variant?: 'header' | 'homepage'
  onClose?: () => void
}

export default function SearchBar({ variant = 'homepage', onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      router.push(`/search?airport=${encodeURIComponent(query.trim())}`)
      setQuery('')
      if (onClose) onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('')
      if (onClose) onClose()
    }
  }

  const isHeader = variant === 'header'

  return (
    <div>
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

      <form onSubmit={handleSearch} className={isHeader ? '' : 'max-w-2xl mx-auto'}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHeader ? "Search airports..." : "Enter airport code (e.g., ATL, KATL)"}
            className={`w-full px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
              isHeader ? 'py-2 text-sm' : 'py-4 text-lg'
            }`}
            autoFocus={isHeader}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700"
            aria-label="Search"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
