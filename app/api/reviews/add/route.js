import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const newReview = await request.json()
    
    newReview.id = Date.now().toString()
    
    let reviews = []
    let oldBlobUrl = null
    
    try {
      const { blobs } = await list()
      const reviewsBlob = blobs.find(b => b.pathname === 'reviews.json')
      if (reviewsBlob) {
        oldBlobUrl = reviewsBlob.url
        const response = await fetch(reviewsBlob.url)
        reviews = await response.json()
      }
    } catch (error) {
      console.log('No existing reviews file')
    }
    
    reviews.push(newReview)
    
    if (oldBlobUrl) {
      await del(oldBlobUrl)
    }
    
    await put('reviews.json', JSON.stringify(reviews, null, 2), {
      access: 'public',
      contentType: 'application/json',
    })
    
    return NextResponse.json({ success: true, review: newReview })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
