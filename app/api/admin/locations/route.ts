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
    const status = searchParams.get('status') // 'pending', 'approved', 'all'

    const sql = neon(process.env.DATABASE_URL!)

    let locations
    if (status === 'pending') {
      locations = await sql`
        SELECT
          b.id,
          b.business_slug,
          b.location_name,
          b.address,
          b.category,
          b.airport_code,
          b.approved,
          b.created_at,
          COUNT(r.id) as review_count,
          ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON r.business_id = b.id
        WHERE b.approved = false OR b.approved IS NULL
        GROUP BY b.id
        ORDER BY b.created_at DESC
        LIMIT 100
      `
    } else if (status === 'approved') {
      locations = await sql`
        SELECT
          b.id,
          b.business_slug,
          b.location_name,
          b.address,
          b.category,
          b.airport_code,
          b.approved,
          b.created_at,
          COUNT(r.id) as review_count,
          ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON r.business_id = b.id
        WHERE b.approved = true
        GROUP BY b.id
        ORDER BY b.created_at DESC
        LIMIT 100
      `
    } else {
      locations = await sql`
        SELECT
          b.id,
          b.business_slug,
          b.location_name,
          b.address,
          b.category,
          b.airport_code,
          b.approved,
          b.created_at,
          COUNT(r.id) as review_count,
          ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON r.business_id = b.id
        GROUP BY b.id
        ORDER BY b.created_at DESC
        LIMIT 100
      `
    }

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin()
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const { id, approved } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      UPDATE businesses
      SET approved = ${approved}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
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
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`DELETE FROM review_photos WHERE review_id IN (SELECT id FROM reviews WHERE business_id = ${id})`
    await sql`DELETE FROM reviews WHERE business_id = ${id}`
    await sql`DELETE FROM businesses WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}
