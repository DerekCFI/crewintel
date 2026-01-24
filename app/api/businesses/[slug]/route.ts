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
        , ROUND(AVG(CASE WHEN breakfast IS NOT NULL AND breakfast NOT IN ('not-available', 'not-sure') THEN 1.0 ELSE 0.0 END) * 100) as breakfast_pct
        , ROUND(AVG(CASE WHEN laundry_available IS NOT NULL AND laundry_available NOT IN ('none', '', 'not-sure') THEN 1.0 ELSE 0.0 END) * 100) as laundry_pct
        , ROUND(AVG(CASE WHEN blackout_curtains THEN 1.0 ELSE 0.0 END) * 100) as blackout_pct
        , COUNT(CASE WHEN parking_situation IS NOT NULL AND parking_situation != 'not-sure' THEN 1 END) as parking_count
        , COUNT(CASE WHEN laundry_available IS NOT NULL AND laundry_available != 'not-sure' THEN 1 END) as laundry_count
        , COUNT(CASE WHEN breakfast IS NOT NULL AND breakfast != 'not-sure' THEN 1 END) as breakfast_count
      `
    } else if (category === 'fbos') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN crew_car_availability IN ('always', 'usually') THEN 1.0 ELSE 0.0 END) * 100) as crew_car_pct
        , ROUND(AVG(CASE WHEN catering_available THEN 1.0 ELSE 0.0 END) * 100) as catering_pct
        , ROUND(AVG(CASE WHEN hangar_availability IN ('yes-easy', 'yes-limited') THEN 1.0 ELSE 0.0 END) * 100) as hangar_pct
        , ROUND(AVG(CASE WHEN twentyfour_seven_service THEN 1.0 ELSE 0.0 END) * 100) as twentyfour_seven_pct
        , ROUND(AVG(CASE WHEN crew_lounge_quality > 0 THEN crew_lounge_quality END)::numeric, 1) as avg_crew_lounge
        , COUNT(CASE WHEN crew_lounge_quality > 0 THEN 1 END) as crew_lounge_count
        , ROUND(AVG(CASE WHEN fbo_wifi_quality > 0 THEN fbo_wifi_quality END)::numeric, 1) as avg_wifi
        , COUNT(CASE WHEN fbo_wifi_quality > 0 THEN 1 END) as wifi_count
        , ROUND(AVG(CASE WHEN bathroom_quality > 0 THEN bathroom_quality END)::numeric, 1) as avg_bathroom
        , COUNT(CASE WHEN bathroom_quality > 0 THEN 1 END) as bathroom_count
        , ROUND(AVG(CASE WHEN fbo_amenities_quality > 0 THEN fbo_amenities_quality END)::numeric, 1) as avg_amenities
        , COUNT(CASE WHEN fbo_amenities_quality > 0 THEN 1 END) as amenities_count
      `
    } else if (category === 'restaurants') {
      amenityFields = `
        , ROUND(AVG(CASE WHEN restaurant_wifi_available THEN 1.0 ELSE 0.0 END) * 100) as wifi_pct
        , ROUND(AVG(CASE WHEN healthy_options THEN 1.0 ELSE 0.0 END) * 100) as healthy_pct
        , ROUND(AVG(CASE WHEN vegetarian_options THEN 1.0 ELSE 0.0 END) * 100) as vegetarian_pct
        , ROUND(AVG(CASE WHEN vegan_options THEN 1.0 ELSE 0.0 END) * 100) as vegan_pct
        , ROUND(AVG(CASE WHEN takeout_quality > 0 THEN 1.0 ELSE 0.0 END) * 100) as takeout_pct
        , COUNT(CASE WHEN was_takeout_delivery THEN 1 END) as takeout_delivery_count
        , ROUND(AVG(CASE WHEN atmosphere IS NOT NULL AND NOT was_takeout_delivery THEN
            CASE atmosphere
              WHEN 'quiet' THEN 5
              WHEN 'conversational' THEN 4
              WHEN 'lively' THEN 3
              WHEN 'loud' THEN 2
              WHEN 'very-loud' THEN 1
            END
          END)::numeric, 1) as avg_atmosphere
        , COUNT(CASE WHEN atmosphere IS NOT NULL AND NOT was_takeout_delivery THEN 1 END) as atmosphere_count
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
        visit_date,
        visit_date_end,
        was_takeout_delivery
      FROM reviews
      WHERE business_slug = ${slug}
      AND category = ${category}
      ORDER BY created_at DESC
    `

    // Get all photos for this business (across all reviews)
    const allPhotos = await sql`
      SELECT
        rp.id,
        rp.review_id,
        rp.cloudinary_url as url,
        rp.thumbnail_url,
        rp.cloudinary_public_id as public_id,
        rp.display_order,
        rp.width,
        rp.height
      FROM review_photos rp
      INNER JOIN reviews r ON rp.review_id = r.id
      WHERE r.business_slug = ${slug}
      AND r.category = ${category}
      ORDER BY rp.created_at DESC
    `

    // Get photo counts per review for the review list
    const photoCountsResult = await sql`
      SELECT
        review_id,
        COUNT(*) as photo_count
      FROM review_photos rp
      INNER JOIN reviews r ON rp.review_id = r.id
      WHERE r.business_slug = ${slug}
      AND r.category = ${category}
      GROUP BY review_id
    `

    // Create a map of review_id -> photo_count
    const photoCounts: Record<number, number> = {}
    for (const row of photoCountsResult) {
      photoCounts[row.review_id] = Number(row.photo_count)
    }

    // Add photo count to each review
    const reviewsWithPhotoCounts = reviews.map(review => ({
      ...review,
      photo_count: photoCounts[review.id] || 0
    }))

    return NextResponse.json({
      business: businessResult[0],
      reviews: reviewsWithPhotoCounts,
      photos: allPhotos
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}
