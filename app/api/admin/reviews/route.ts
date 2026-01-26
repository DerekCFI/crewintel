import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { requireAdmin } from '@/app/lib/admin-auth'

export async function GET(request: Request) {
  const authResult = await requireAdmin()
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'flagged', 'all'
    const category = searchParams.get('category')

    const sql = neon(process.env.DATABASE_URL!)

    let reviews
    if (status === 'flagged') {
      reviews = await sql`
        SELECT
          r.id,
          r.location_name,
          r.category,
          r.airport_code,
          r.overall_rating,
          r.review_text,
          r.user_email,
          r.flagged,
          r.spam_score,
          r.created_at,
          b.business_slug
        FROM reviews r
        LEFT JOIN businesses b ON r.business_id = b.id
        WHERE r.flagged = true
        ${category ? sql`AND r.category = ${category}` : sql``}
        ORDER BY r.created_at DESC
        LIMIT 100
      `
    } else {
      reviews = await sql`
        SELECT
          r.id,
          r.location_name,
          r.category,
          r.airport_code,
          r.overall_rating,
          r.review_text,
          r.user_email,
          r.flagged,
          r.spam_score,
          r.created_at,
          b.business_slug
        FROM reviews r
        LEFT JOIN businesses b ON r.business_id = b.id
        WHERE 1=1
        ${category ? sql`AND r.category = ${category}` : sql``}
        ORDER BY r.created_at DESC
        LIMIT 100
      `
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin()
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const { id, flagged } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      UPDATE reviews
      SET flagged = ${flagged}
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authResult = await requireAdmin()
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`DELETE FROM review_photos WHERE review_id = ${id}`
    await sql`DELETE FROM reviews WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
