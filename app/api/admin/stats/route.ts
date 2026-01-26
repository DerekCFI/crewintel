import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { requireAdmin } from '@/app/lib/admin-auth'

export async function GET() {
  const authResult = await requireAdmin()
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    const [
      reviewStats,
      locationStats,
      userStats,
      categoryStats,
      recentActivity,
      pendingLocations,
      flaggedReviews
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM reviews`,
      sql`SELECT COUNT(*) as count FROM businesses`,
      sql`SELECT COUNT(DISTINCT user_email) as count FROM reviews WHERE user_email IS NOT NULL`,
      sql`
        SELECT category, COUNT(*) as count
        FROM reviews
        GROUP BY category
        ORDER BY count DESC
      `,
      sql`
        SELECT COUNT(*) as count
        FROM reviews
        WHERE created_at > NOW() - INTERVAL '7 days'
      `,
      sql`SELECT COUNT(*) as count FROM businesses WHERE approved = false OR approved IS NULL`,
      sql`SELECT COUNT(*) as count FROM reviews WHERE flagged = true`
    ])

    return NextResponse.json({
      totalReviews: parseInt(reviewStats[0].count as string),
      totalLocations: parseInt(locationStats[0].count as string),
      totalUsers: parseInt(userStats[0].count as string),
      reviewsByCategory: categoryStats,
      recentReviews: parseInt(recentActivity[0].count as string),
      pendingLocations: parseInt(pendingLocations[0].count as string),
      flaggedReviews: parseInt(flaggedReviews[0].count as string)
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
