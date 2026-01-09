import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  
  try {
    const { blobs } = await list()
    const restaurantsBlob = blobs.find(b => b.pathname === 'restaurants.json')
    
    if (restaurantsBlob) {
      const response = await fetch(restaurantsBlob.url)
      const restaurants = await response.json()
      const restaurant = restaurants.find(r => r.id === id)
      
      if (restaurant) {
        return NextResponse.json(restaurant)
      }
    }
    
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
