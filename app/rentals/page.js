import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function RentalsPage() {
  let rentals = []
  
  try {
    const { blobs } = await list()
    const rentalsBlob = blobs.find(b => b.pathname === 'rentals.json')
    
    if (rentalsBlob) {
      const response = await fetch(rentalsBlob.url, { cache: 'no-store' })
      rentals = await response.json()
    }
  } catch (error) {
    console.error('Error loading car rentals:', error)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Car Rentals</h1>
        
        {rentals.length === 0 ? (
          <p className="text-gray-600">No car rental companies yet. Be the first to add one!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rentals.map((rental) => (
              <Link key={rental.id} href={`/rentals/${rental.id}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block">
                <h2 className="text-xl font-bold mb-2">{rental.name}</h2>
                <p className="text-gray-600 mb-4">{rental.city}, {rental.state}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Rating:</span>
                    <span className="font-semibold">{rental.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Airport Pickup:</span>
                    <span>{rental.airportPickup ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>After Hours Return:</span>
                    <span>{rental.afterHoursReturn ? '✓' : '✗'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
