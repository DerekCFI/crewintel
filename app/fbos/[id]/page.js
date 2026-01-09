import { list } from '@vercel/blob'
import Link from 'next/link'

export const revalidate = 0

export default async function FBODetailPage({ params }) {
  const { id } = await params
  let fbo = null
  
  try {
    const { blobs } = await list()
    const fbosBlob = blobs.find(b => b.pathname === 'fbos.json')
    
    if (fbosBlob) {
      const response = await fetch(fbosBlob.url)
      const fbos = await response.json()
      fbo = fbos.find(f => f.id === id)
    }
  } catch (error) {
    console.error('Error loading FBO:', error)
  }
  
  if (!fbo) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">FBO Not Found</h1>
          <Link href="/fbos" className="text-blue-600 hover:underline">
            ← Back to FBOs
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/fbos" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to FBOs
        </Link>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold mb-2">{fbo.name}</h1>
          <p className="text-xl text-gray-600 mb-8">{fbo.airport} - {fbo.city}, {fbo.state}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Overall Rating:</span>
                  <span className="text-blue-600 font-bold">{fbo.rating}/5</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Crew Lounge:</span>
                  <span>{fbo.hasCrewLounge ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Snooze Room:</span>
                  <span>{fbo.hasSnoozeRoom ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Bathroom Quality:</span>
                  <span className="px-3 py-1 bg-gray-100 rounded">{fbo.bathroomQuality}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Information</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Added:</span> {new Date(fbo.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">ID:</span> {fbo.id}</p>
              </div>
            </div>
          </div>
