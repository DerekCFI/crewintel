import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function HotelDetailPage({ params }) {
  const { id } = await params
  let hotel = null
  
  try {
    const { blobs } = await list()
    const hotelsBlob = blobs.find(b => b.pathname === 'hotels.json')
    
    if (hotelsBlob) {
      const response = await fetch(hotelsBlob.url)
      const hotels = await response.json()
      hotel = hotels.find(h => h.id === id)
    }
  } catch (error) {
    console.error('Error loading hotel:', error)
  }
  
  if (!hotel) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Hotel Not Found</h1>
          <Link href="/hotels" className="text-blue-600 hover:underline">
            ← Back to Hotels
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/hotels" className="text-blue-600 hover:underline">
            ← Back to Hotels
          </Link>
          <Link 
  href={`/review/hotel/${hotel.id}`}
  className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 whitespace-nowrap"
  style={{ paddingLeft: '24px', paddingRight: '24px' }}
>
  Leave Review
</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-xl text-gray-600 mb-8">{hotel.city}, {hotel.state}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Overall Rating:</span>
                  <span className="text-blue-600 font-bold">{hotel.rating}/5</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">24-Hour Check-in:</span>
                  <span>{hotel.has24HourCheckin ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Blackout Curtains:</span>
                  <span>{hotel.hasBlackoutCurtains ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Noise Level:</span>
                  <span className="px-3 py-1 bg-gray-100 rounded">{hotel.noiseLevel}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Added:</span> {hotel.createdAt ? hotel.createdAt.split('T')[0] : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
