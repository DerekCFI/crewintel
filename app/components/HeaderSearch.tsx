'use client'

import { useState } from 'react'
import SearchBar from './SearchBar'

export default function HeaderSearch() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      {!isExpanded ? (
        // Magnifying glass icon
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          aria-label="Search airports"
        >
          <svg 
            className="w-6 h-6 text-white" 
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
      ) : (
        // Expanded search bar
        <div className="absolute right-0 top-0 w-80 bg-white rounded-lg shadow-lg p-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <SearchBar variant="header" onClose={() => setIsExpanded(false)} />
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close search"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
