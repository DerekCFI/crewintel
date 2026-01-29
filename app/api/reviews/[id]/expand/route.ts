import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const reviewIdNum = parseInt(id, 10)

    if (isNaN(reviewIdNum)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      SELECT * FROM reviews
      WHERE id = ${reviewIdNum}
      AND user_id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ review: result[0] })
  } catch (error) {
    console.error('Error fetching review for expansion:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}
