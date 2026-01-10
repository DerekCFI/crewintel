'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Airport {
  iata: string
  icao: string
  name: string
  city: string
  state: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const airportQuery = searchParams.get('airport')
  const [airport, setAirport] = useState<Airport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchAirport = async () => {
      if (!airportQuery) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search/airports?q=${encodeURIComponent(airportQuery)}`)
        const data = await response.json()
        
        if (data.airports && data.airports.length > 0) {
          setAirport(data.airports[0])
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching airport:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAirport()
  }, [airportQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !airport) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Airport Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find an airport matching "{airportQuery}"
          </p>
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Airport Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {airport.iata} / {airport.icao}
          </h1>
          <h2 className="text-xl text-gray-700 mb-1">{airport.name}</h2>
          <p className="text-gray-600">{airport.city}, {airport.state}</p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
            href={`/hotels?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotels</h3>
            <p className="text-gray-600 text-sm">Find crew-friendly hotels near {airport.iata}</p>
          </Link>

          <Link 
            href={`/fbos?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">FBOs</h3>
            <p className="text-gray-600 text-sm">Browse FBO services at {airport.iata}</p>
          </Link>

          <Link 
            href={`/rentals?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Car Rentals</h3>
            <p className="text-gray-600 text-sm">Find rental cars near {airport.iata}</p>
          </Link>

          <Link 
            href={`/restaurants?airport=${airport.iata}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Restaurants</h3>
            <p className="text-gray-600 text-sm">Discover restaurants near {airport.iata}</p>
          </Link>
        </div>

          {/* Placeholder for reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
          <p className="text-gray-600">No reviews yet for hotels, FBOs, car rentals, or restaurants near {airport.iata}. Be the first to share your crew experience!</p>
        </div>
      </div>
    </div>
  )
}
