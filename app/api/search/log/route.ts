import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  // Fire-and-forget analytics logging - always return success
  try {
    const { userId } = await auth()
    const body = await request.json()

    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      INSERT INTO search_logs (
        user_id,
        airport_code,
        location_searched,
        category,
        searched_at
      ) VALUES (
        ${userId || null},
        ${body.airportCode || null},
        ${body.locationSearched || null},
        ${body.category || null},
        NOW()
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log error but don't fail the request - this is fire-and-forget
    console.error('Error logging search:', error)
    return NextResponse.json({ success: false })
  }
}
