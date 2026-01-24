import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM reviews 
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Get photos for this review
    const photos = await sql`
      SELECT
        id,
        cloudinary_url as url,
        thumbnail_url,
        cloudinary_public_id as public_id,
        display_order,
        width,
        height
      FROM review_photos
      WHERE review_id = ${parseInt(id)}
      ORDER BY display_order ASC
    `

    return NextResponse.json({
      review: result[0],
      photos: photos
    })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}
