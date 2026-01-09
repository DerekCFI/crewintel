import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function RestaurantsPage() {
  let restaurants = []
  
  try {
    const { blobs } = await list()
    const restaurantsBlob = blobs.find(b => b.pathname === 'restaurants.json')
    
    if (restaurantsBlob) {
      const response = await fetch(restaurantsBlob.url, { cache: 'no-store' })
      restaurants = await response.json()
    }
  } catch (error) {
    console.error('Error loading restaurants:', error)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Restaurants</h1>
        
        {restaurants.length === 0 ? (
          <p className="text-gray-600">No restaurants yet. Be the first to add one!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block">
                <h2 className="text-xl font-bold mb-2">{restaurant.name}</h2>
                <p className="text-gray-600 mb-1">{restaurant.cuisine}</p>
                <p className="text-gray-600 mb-4">{restaurant.city}, {restaurant.state}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Rating:</span>
                    <span className="font-semibold">{restaurant.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Late Night:</span>
                    <span>{restaurant.lateNightService ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Easy Parking:</span>
                    <span>{restaurant.easyParking ? '✓' : '✗'}</span>
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
