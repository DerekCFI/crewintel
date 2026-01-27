'use client'

import { useState, useEffect, useRef } from 'react'
import SearchBar from './SearchBar'

export default function HeaderSearch() {
  const [isExpanded, setIsExpanded] = useState(false)
  const headerSearchRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerSearchRef.current && !headerSearchRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div ref={headerSearchRef} className="flex items-center gap-2">
      {/* Magnifying glass button - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-2 bg-brand-navy/80 hover:bg-brand-navy/70 rounded-full transition-all duration-300 flex-shrink-0 ${
          isExpanded ? 'order-first' : ''
        }`}
        aria-label={isExpanded ? "Close search" : "Search airports"}
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

      {/* Search bar that expands */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-w-[320px] opacity-100' : 'max-w-0 opacity-0'
      }`}>
        <div className="w-80">
          <SearchBar variant="header" onClose={() => setIsExpanded(false)} />
        </div>
      </div>
    </div>
  )
}