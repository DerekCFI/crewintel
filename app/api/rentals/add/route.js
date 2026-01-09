import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const newRental = await request.json()
    
    newRental.id = Date.now().toString()
    newRental.createdAt = new Date().toISOString()
    
    let rentals = []
    let oldBlobUrl = null
    
    try {
      const { blobs } = await list()
      const rentalsBlob = blobs.find(b => b.pathname === 'rentals.json')
      if (rentalsBlob) {
        oldBlobUrl = rentalsBlob.url
        const response = await fetch(rentalsBlob.url)
        rentals = await response.json()
      }
    } catch (error) {
      console.log('No existing car rentals file')
    }
    
    rentals.push(newRental)
    
    if (oldBlobUrl) {
      await del(oldBlobUrl)
    }
    
    await put('rentals.json', JSON.stringify(rentals, null, 2), {
      access: 'public',
      contentType: 'application/json',
    })
    
    return NextResponse.json({ success: true, rental: newRental })
  } catch (error) {
    console.error('Error saving car rental:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
