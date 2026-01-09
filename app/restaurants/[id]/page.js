import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function RestaurantDetailPage({ params }) {
  const { id } = await params
  let restaurant = null
  
  try {
    const { blobs } = await list()
    const restaurantsBlob = blobs.find(b => b.pathname === 'restaurants.json')
    
    if (restaurantsBlob) {
      const response = await fetch(restaurantsBlob.url)
      const restaurants = await response.json()
      restaurant = restaurants.find(r => r.id === id)
    }
  } catch (error) {
    console.error('Error loading restaurant:', error)
  }
  
  if (!restaurant) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Restaurant Not Found</h1>
          <Link href="/restaurants" className="text-blue-600 hover:underline">
            ← Back to Restaurants
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/restaurants" className="text-blue-600 hover:underline">
            ← Back to Restaurants
          </Link>
          <Link 
  href={`/review/restaurant/${restaurant.id}`}
  className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 whitespace-nowrap"
  style={{ paddingLeft: '28px', paddingRight: '28px' }}
>
  Leave Review
</Link>

        </div>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-xl text-gray-600 mb-2">{restaurant.cuisine}</p>
          <p className="text-lg text-gray-500 mb-8">{restaurant.city}, {restaurant.state}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Overall Rating:</span>
                  <span className="text-blue-600 font-bold">{restaurant.rating}/5</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Price Range:</span>
                  <span className="font-semibold">{restaurant.priceRange}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Late Night Service:</span>
                  <span>{restaurant.lateNightService ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Easy Parking:</span>
                  <span>{restaurant.easyParking ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Healthy Options:</span>
                  <span>{restaurant.hasHealthyOptions ? '✓ Yes' : '✗ No'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Added:</span> {restaurant.createdAt ? restaurant.createdAt.split('T')[0] : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
