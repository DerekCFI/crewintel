import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  
  try {
    const { blobs } = await list()
    const hotelsBlob = blobs.find(b => b.pathname === 'hotels.json')
    
    if (hotelsBlob) {
      const response = await fetch(hotelsBlob.url)
      const hotels = await response.json()
      const hotel = hotels.find(h => h.id === id)
      
      if (hotel) {
        return NextResponse.json(hotel)
      }
    }
    
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
