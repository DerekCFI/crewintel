import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const newHotel = await request.json()
    
    // Add unique ID and timestamp
    newHotel.id = Date.now().toString()
    newHotel.createdAt = new Date().toISOString()
    
    // Get existing hotels
    let hotels = []
    let oldBlobUrl = null
    
    try {
      const { blobs } = await list()
      const hotelsBlob = blobs.find(b => b.pathname === 'hotels.json')
      if (hotelsBlob) {
        oldBlobUrl = hotelsBlob.url
        const response = await fetch(hotelsBlob.url)
        hotels = await response.json()
      }
    } catch (error) {
      console.log('No existing hotels file')
    }
    
    // Add new hotel
    hotels.push(newHotel)
    
    // Delete old blob if it exists
    if (oldBlobUrl) {
      await del(oldBlobUrl)
    }
    
    // Save new blob
    await put('hotels.json', JSON.stringify(hotels, null, 2), {
      access: 'public',
      contentType: 'application/json',
    })
    
    return NextResponse.json({ success: true, hotel: newHotel })
  } catch (error) {
    console.error('Error saving hotel:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
