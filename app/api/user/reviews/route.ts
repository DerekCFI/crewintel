import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const reviews = await sql`
      SELECT
        id,
        category,
        location_name,
        business_slug,
        address,
        airport_code,
        overall_rating,
        review_text,
        COALESCE(status, 'published') as status,
        COALESCE(is_quick_log, false) as is_quick_log,
        created_at,
        COALESCE(updated_at, created_at) as updated_at
      FROM reviews
      WHERE user_id = ${userId}
      ORDER BY COALESCE(updated_at, created_at) DESC
    `

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
