import Link from 'next/link'
import SearchBar from '../components/SearchBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section with Search */}
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-work-sans)' }}>
            CrewIntel
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Your crew's guide to the best travel services
          </p>
        </div>

        {/* Prominent Search Component */}
        <SearchBar variant="homepage" />

        {/* Quick Log CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/quick-log"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-orange/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Log
          </Link>
          <p className="text-sm text-gray-500 mt-2">Log a review in 30 seconds</p>
        </div>

        {/* Quick Category Links */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/hotels"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">🏨</div>
            <h3 className="font-semibold text-gray-900">Hotels</h3>
          </a>
          
          <a
            href="/fbos"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">✈️</div>
            <h3 className="font-semibold text-gray-900">FBOs</h3>
          </a>
          
          <a
            href="/rentals"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">🚗</div>
            <h3 className="font-semibold text-gray-900">Car Rentals</h3>
          </a>
          
          <a
            href="/restaurants"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">🍴</div>
            <h3 className="font-semibold text-gray-900">Restaurants</h3>
          </a>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Crews Choose CrewIntel
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Crew-Specific Reviews
              </h3>
              <p className="text-gray-600">
                Reviews focused on what matters to flight crews - 24-hour check-in, crew lounges, and more
              </p>
            </div>
            
              <div className="text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nationwide Coverage
                </h3>
                <p className="text-gray-600">
                  Find crew-friendly services at airports across the United States
                </p>
              </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                By Crews, For Crews
              </h3>
              <p className="text-gray-600">
                Built by flight crew professionals who understand your unique travel needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
