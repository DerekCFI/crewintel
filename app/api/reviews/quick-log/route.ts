import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body // 'draft' or 'publish'

    // Validate required fields
    if (!body.category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!body.locationName) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }
    if (!body.overallRating || body.overallRating < 1 || body.overallRating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const status = action === 'draft' ? 'draft' : 'published'

    // Generate business slug from location name
    const businessSlug = body.locationName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Upsert business record (same pattern as existing /api/reviews)
    const businessResult = await sql`
      INSERT INTO businesses (
        business_slug,
        category,
        location_name,
        address,
        phone,
        latitude,
        longitude,
        airport_code,
        approved,
        created_at,
        updated_at
      ) VALUES (
        ${businessSlug},
        ${body.category},
        ${body.locationName},
        ${body.address || null},
        ${body.phone || null},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.airportCode ? body.airportCode.toUpperCase() : null},
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (business_slug, category) DO UPDATE SET
        updated_at = NOW(),
        phone = COALESCE(EXCLUDED.phone, businesses.phone),
        latitude = COALESCE(EXCLUDED.latitude, businesses.latitude),
        longitude = COALESCE(EXCLUDED.longitude, businesses.longitude)
      RETURNING id
    `

    const businessId = businessResult[0].id

    // Insert quick log review with minimal fields
    const result = await sql`
      INSERT INTO reviews (
        category,
        airport_code,
        location_name,
        business_slug,
        business_id,
        address,
        phone,
        latitude,
        longitude,
        overall_rating,
        review_text,
        would_recommend,
        crew_recognition,
        user_id,
        status,
        is_quick_log,
        created_at,
        updated_at
      ) VALUES (
        ${body.category},
        ${body.airportCode ? body.airportCode.toUpperCase() : null},
        ${body.locationName},
        ${businessSlug},
        ${businessId},
        ${body.address || null},
        ${body.phone || null},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.overallRating},
        ${''}, -- Empty review text for quick log
        ${body.wouldRecommend},
        ${body.crewFriendly},
        ${userId},
        ${status},
        true,
        NOW(),
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result[0].id,
      status: status,
      businessSlug: businessSlug
    })
  } catch (error) {
    console.error('Error creating quick log:', error)
    return NextResponse.json(
      { error: 'Failed to create quick log' },
      { status: 500 }
    )
  }
}
