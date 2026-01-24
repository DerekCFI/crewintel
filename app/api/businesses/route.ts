import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { calculateDistance } from '@/app/lib/distance'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const airport = searchParams.get('airport')

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // If airport parameter provided, look up airport coordinates
    interface AirportCoords {
      latitude: number
      longitude: number
      name: string
      iata_code: string
      icao_code: string
    }
    let airportCoords: AirportCoords | null = null
    if (airport) {
      const airportResult = await sql`
        SELECT latitude, longitude, name, iata_code, icao_code
        FROM airports
        WHERE UPPER(iata_code) = ${airport.toUpperCase()}
           OR UPPER(icao_code) = ${airport.toUpperCase()}
        LIMIT 1
      `
      if (airportResult.length === 0) {
        return NextResponse.json({ error: 'Airport not found' }, { status: 404 })
      }
      airportCoords = airportResult[0] as AirportCoords
    }

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

    // Get aggregated business data with category-specific amenity percentages
    // Use businesses table for canonical data, join with reviews for aggregates
    // This prevents duplicate keys when reviews have slightly different addresses
    const businesses = await sql`
      SELECT
        b.id as business_id,
        b.business_slug,
        b.location_name,
        b.address,
        b.latitude,
        b.longitude,
        b.airport_code,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating,
        MAX(r.created_at) as latest_review_date,
        BOOL_OR(r.would_recommend) as has_recommendations
        ${sql.unsafe(amenityFields)}
      FROM businesses b
      LEFT JOIN reviews r ON r.business_id = b.id
      WHERE b.category = ${category}
      GROUP BY b.id, b.business_slug, b.location_name, b.address, b.latitude, b.longitude, b.airport_code
      HAVING COUNT(r.id) > 0
      ORDER BY latest_review_date DESC
    `

    // If airport provided, filter businesses by distance and add distance field
    let filteredBusinesses: Array<Record<string, unknown> & { distance_from_airport?: number }> = businesses
    if (airportCoords) {
      const airportLat = airportCoords.latitude
      const airportLon = airportCoords.longitude
      filteredBusinesses = businesses
        .map(business => ({
          ...business,
          distance_from_airport: calculateDistance(
            airportLat,
            airportLon,
            business.latitude as number,
            business.longitude as number
          )
        }))
        .filter(b => b.distance_from_airport! <= 30)
        .sort((a, b) => a.distance_from_airport! - b.distance_from_airport!)
    }

    // For each business, get 2 most recent review snippets
    const businessesWithReviews = await Promise.all(
      filteredBusinesses.map(async (business) => {
        const recentReviews = await sql`
          SELECT id, review_text, overall_rating, would_recommend, created_at
          FROM reviews
          WHERE business_slug = ${business.business_slug}
          AND category = ${category}
          ORDER BY created_at DESC
          LIMIT 2
        `

        return {
          ...business,
          recent_reviews: recentReviews
        }
      })
    )

    return NextResponse.json({ businesses: businessesWithReviews })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
