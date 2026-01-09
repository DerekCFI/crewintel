import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { businessType, businessId } = await params
  
  try {
    const { blobs } = await list()
    const reviewsBlob = blobs.find(b => b.pathname === 'reviews.json')
    
    if (reviewsBlob) {
      const response = await fetch(reviewsBlob.url)
      const allReviews = await response.json()
      
      // Filter reviews for this specific business
      const businessReviews = allReviews.filter(
        r => r.businessType === businessType && r.businessId === businessId
      )
      
      return NextResponse.json(businessReviews)
    }
    
    return NextResponse.json([])
  } catch (error) {
    console.error('Error loading reviews:', error)
    return NextResponse.json([])
  }
}
