import { list } from '@vercel/blob'
import { neon } from '@neondatabase/serverless'
import Link from 'next/link'

export const revalidate = 0
export const dynamic = 'force-dynamic'

async function getReviews(businessId) {
  try {
    const sql = neon(process.env.DATABASE_URL)
    const reviews = await sql`
      SELECT * FROM reviews 
      WHERE business_type = 'rental' AND business_id = ${businessId}
      ORDER BY created_at DESC
    `
    return reviews
  } catch (error) {
    console.error('Error loading reviews:', error)
    return []
  }
}

export default async function RentalDetailPage({ params }) {
  const { id } = await params
  let rental = null
  
  try {
    const { blobs } = await list()
    const rentalsBlob = blobs.find(b => b.pathname === 'rentals.json')
    
    if (rentalsBlob) {
      const response = await fetch(rentalsBlob.url, { cache: 'no-store' })
      const rentals = await response.json()
      rental = rentals.find(r => r.id === id)
    }
  } catch (error) {
    console.error('Error loading car rental:', error)
  }
  
  if (!rental) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Car Rental Not Found</h1>
          <Link href="/rentals" className="text-blue-600 hover:underline">
            ← Back to Car Rentals
          </Link>
        </div>
      </main>
    )
  }

  const reviews = await getReviews(id)

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/rentals" className="text-blue-600 hover:underline">
            ← Back to Car Rentals
          </Link>
          <Link 
            href={`/review/rental/${rental.id}`}
            className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 whitespace-nowrap"
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
          >
            Leave Review
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold mb-2">{rental.name}</h1>
          <p className="text-xl text-gray-600 mb-8">{rental.city}, {rental.state}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Overall Rating:</span>
                  <span className="text-blue-600 font-bold">{rental.rating}/5</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Airport Pickup:</span>
                  <span>{rental.airportPickup ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">After Hours Return:</span>
                  <span>{rental.afterHoursReturn ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Crew Discounts:</span>
                  <span>{rental.crewDiscounts ? '✓ Yes' : '✗ No'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Added:</span> {rental.createdAt ? rental.createdAt.split('T')[0] : 'N/A'}</p>
                <p><span className="font-medium">Total Reviews:</span> {reviews.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-6">Reviews ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-blue-600">{review.overall_rating}/5</span>
                      <div className="text-sm text-gray-500">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Vehicle Quality:</span>
                      <span className="font-semibold ml-2">{review.vehicle_quality_rating}/5</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Customer Service:</span>
                      <span className="font-semibold ml-2">{review.customer_service_rating}/5</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
