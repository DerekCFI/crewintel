import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { calculateDistance } from '@/app/lib/distance'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const airport = searchParams.get('airport')
  const radiusParam = searchParams.get('radius')
  const radius = radiusParam ? parseInt(radiusParam, 10) : 30

  if (!airport) {
    return NextResponse.json(
      { error: 'Airport code is required' },
      { status: 400 }
    )
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Look up airport coordinates
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

    const airportData = airportResult[0] as {
      latitude: number
      longitude: number
      name: string
      iata_code: string
      icao_code: string
    }

    // Fetch recent reviews from all categories with coordinates
    const reviews = await sql`
      SELECT
        id,
        category,
        business_slug,
        location_name,
        overall_rating,
        review_text,
        created_at,
        latitude,
        longitude,
        is_quick_log
      FROM reviews
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND (status IS NULL OR status = 'published')
      ORDER BY created_at DESC
      LIMIT 100
    `

    // Calculate distance and filter by radius
    const nearbyReviews = reviews
      .map(review => ({
        id: review.id as number,
        category: review.category as string,
        business_slug: review.business_slug as string,
        location_name: review.location_name as string,
        overall_rating: review.overall_rating as number,
        review_text: review.review_text as string,
        created_at: review.created_at as string,
        is_quick_log: review.is_quick_log as boolean,
        distance_from_airport: calculateDistance(
          airportData.latitude,
          airportData.longitude,
          review.latitude as number,
          review.longitude as number
        )
      }))
      .filter(r => r.distance_from_airport <= radius)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return NextResponse.json({ reviews: nearbyReviews })
  } catch (error) {
    console.error('Error fetching nearby reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby reviews' },
      { status: 500 }
    )
  }
}
