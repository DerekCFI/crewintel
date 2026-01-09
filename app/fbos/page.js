import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function FBOsPage() {
  let fbos = []
  
  try {
    const { blobs } = await list()
    const fbosBlob = blobs.find(b => b.pathname === 'fbos.json')
    
    if (fbosBlob) {
      const response = await fetch(fbosBlob.url, { cache: 'no-store' })
      fbos = await response.json()
    }
  } catch (error) {
    console.error('Error loading FBOs:', error)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">FBOs</h1>
        
        {fbos.length === 0 ? (
          <p className="text-gray-600">No FBOs yet. Be the first to add one!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fbos.map((fbo) => (
              <Link key={fbo.id} href={`/fbos/${fbo.id}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block">
                <h2 className="text-xl font-bold mb-2">{fbo.name}</h2>
                <p className="text-gray-600 mb-4">{fbo.airport} - {fbo.city}, {fbo.state}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Rating:</span>
                    <span className="font-semibold">{fbo.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Crew Lounge:</span>
                    <span>{fbo.hasCrewLounge ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Snooze Room:</span>
                    <span>{fbo.hasSnoozeRoom ? '✓' : '✗'}</span>
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
