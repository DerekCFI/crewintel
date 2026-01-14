import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Build category-specific amenity calculations
    let amenityFields = ''

    if (category === 'hotels') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN crew_recognition THEN 1.0 ELSE 0.0 END) * 100) as crew_rates_pct
        , ROUND(AVG(CASE WHEN shuttle_service THEN 1.0 ELSE 0.0 END) * 100) as shuttle_pct
        , ROUND(AVG(CASE WHEN fitness_center THEN 1.0 ELSE 0.0 END) * 100) as fitness_pct
        , ROUND(AVG(CASE WHEN breakfast IS NOT NULL AND breakfast != 'not-available' THEN 1.0 ELSE 0.0 END) * 100) as breakfast_pct
        , ROUND(AVG(CASE WHEN laundry_available IS NOT NULL AND laundry_available NOT IN ('none', '') THEN 1.0 ELSE 0.0 END) * 100) as laundry_pct
        , ROUND(AVG(CASE WHEN blackout_curtains THEN 1.0 ELSE 0.0 END) * 100) as blackout_pct
      `
    } else if (category === 'fbos') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN crew_car_availability IN ('always', 'usually') THEN 1.0 ELSE 0.0 END) * 100) as crew_car_pct
        , ROUND(AVG(CASE WHEN catering_available THEN 1.0 ELSE 0.0 END) * 100) as catering_pct
        , ROUND(AVG(CASE WHEN hangar_availability IN ('yes-easy', 'yes-limited') THEN 1.0 ELSE 0.0 END) * 100) as hangar_pct
        , ROUND(AVG(CASE WHEN twentyfour_seven_service THEN 1.0 ELSE 0.0 END) * 100) as twentyfour_seven_pct
      `
    } else if (category === 'restaurants') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN restaurant_wifi_available THEN 1.0 ELSE 0.0 END) * 100) as wifi_pct
        , ROUND(AVG(CASE WHEN healthy_options THEN 1.0 ELSE 0.0 END) * 100) as healthy_pct
        , ROUND(AVG(CASE WHEN vegetarian_options THEN 1.0 ELSE 0.0 END) * 100) as vegetarian_pct
        , ROUND(AVG(CASE WHEN vegan_options THEN 1.0 ELSE 0.0 END) * 100) as vegan_pct
        , ROUND(AVG(CASE WHEN takeout_quality > 0 THEN 1.0 ELSE 0.0 END) * 100) as takeout_pct
      `
    } else if (category === 'rentals') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN after_hours_access THEN 1.0 ELSE 0.0 END) * 100) as after_hours_pct
        , ROUND(AVG(CASE WHEN fbo_delivery THEN 1.0 ELSE 0.0 END) * 100) as fbo_delivery_pct
        , ROUND(AVG(CASE WHEN crew_rates_available THEN 1.0 ELSE 0.0 END) * 100) as crew_rates_pct
      `
    }

    // Get business aggregate info with category-specific amenity percentages
    const businessResult = await sql`
      SELECT
        business_slug,
        location_name,
        address,
        phone,
        latitude,
        longitude,
        airport_code,
        COUNT(*) as review_count,
        ROUND(AVG(overall_rating)::numeric, 1) as avg_rating
        ${sql.unsafe(amenityFields)}
      FROM reviews
      WHERE business_slug = ${slug}
      AND category = ${category}
      GROUP BY business_slug, location_name, address, phone, latitude, longitude, airport_code
      LIMIT 1
    `

    if (businessResult.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get all reviews for this business
    const reviews = await sql`
      SELECT 
        id,
        overall_rating,
        review_text,
        would_recommend,
        created_at,
        visit_date
      FROM reviews
      WHERE business_slug = ${slug}
      AND category = ${category}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      business: businessResult[0],
      reviews: reviews
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}
