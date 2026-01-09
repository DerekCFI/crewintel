import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const newRestaurant = await request.json()
    
    newRestaurant.id = Date.now().toString()
    newRestaurant.createdAt = new Date().toISOString()
    
    let restaurants = []
    let oldBlobUrl = null
    
    try {
      const { blobs } = await list()
      const restaurantsBlob = blobs.find(b => b.pathname === 'restaurants.json')
      if (restaurantsBlob) {
        oldBlobUrl = restaurantsBlob.url
        const response = await fetch(restaurantsBlob.url)
        restaurants = await response.json()
      }
    } catch (error) {
      console.log('No existing restaurants file')
    }
    
    restaurants.push(newRestaurant)
    
    if (oldBlobUrl) {
      await del(oldBlobUrl)
    }
    
    await put('restaurants.json', JSON.stringify(restaurants, null, 2), {
      access: 'public',
      contentType: 'application/json',
    })
    
    return NextResponse.json({ success: true, restaurant: newRestaurant })
  } catch (error) {
    console.error('Error saving restaurant:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
