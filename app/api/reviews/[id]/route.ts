import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const sql = neon(process.env.DATABASE_URL!)

    // First verify the user owns this review
    const reviewResult = await sql`
      SELECT id, user_id, status FROM reviews
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `

    if (reviewResult.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = reviewResult[0]
    if (review.user_id !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to modify this review' },
        { status: 403 }
      )
    }

    // Handle publish action
    if (action === 'publish') {
      await sql`
        UPDATE reviews
        SET status = 'published', updated_at = NOW()
        WHERE id = ${parseInt(id)}
      `

      return NextResponse.json({
        success: true,
        message: 'Review published successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
