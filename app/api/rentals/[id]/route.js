import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  
  try {
    const { blobs } = await list()
    const rentalsBlob = blobs.find(b => b.pathname === 'rentals.json')
    
    if (rentalsBlob) {
      const response = await fetch(rentalsBlob.url)
      const rentals = await response.json()
      const rental = rentals.find(r => r.id === id)
      
      if (rental) {
        return NextResponse.json(rental)
      }
    }
    
    return NextResponse.json({ error: 'Car rental not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
