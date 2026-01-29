import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Vercel cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this header for cron jobs)
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    // Also check for Vercel's cron verification
    const vercelCron = request.headers.get('x-vercel-cron')
    if (!vercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Find users with draft reviews older than 7 days
    // Group by user to send one email per user
    const draftsResult = await sql`
      SELECT
        user_id,
        user_email,
        COUNT(*) as draft_count,
        MIN(created_at) as oldest_draft
      FROM reviews
      WHERE status = 'draft'
        AND created_at < NOW() - INTERVAL '7 days'
        AND user_email IS NOT NULL
        AND user_email != ''
      GROUP BY user_id, user_email
    `

    if (draftsResult.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No draft reminders to send',
        count: 0
      })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const row of draftsResult) {
      const email = row.user_email as string
      const draftCount = Number(row.draft_count)

      try {
        await resend.emails.send({
          from: 'CrewIntel <noreply@crewintel.net>',
          to: email,
          subject: `You have ${draftCount} unpublished review${draftCount > 1 ? 's' : ''} on CrewIntel!`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1E3A8A; margin: 0;">CrewIntel</h1>
    <p style="color: #666; margin: 5px 0 0;">Flight Crew Reviews</p>
  </div>

  <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #1E3A8A; margin-top: 0;">Hey there, Captain!</h2>

    <p>You have <strong>${draftCount} unpublished review${draftCount > 1 ? 's' : ''}</strong> waiting for you on CrewIntel.</p>

    <p>Your fellow pilots would love to hear about your experiences! Every review helps the crew community find the best hotels, FBOs, restaurants, and car rentals.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crewintel.net/my-reviews" style="display: inline-block; background: #F97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Finish Your Reviews
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">Don't have time to write a full review? No problem! You can click "Submit Now" to publish your Quick Log as-is.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Safe travels!</p>
    <p>The CrewIntel Team</p>
    <p style="margin-top: 20px;">
      <a href="https://crewintel.net" style="color: #1E3A8A;">crewintel.net</a>
    </p>
  </div>
</body>
</html>
          `
        })
        sentCount++
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError)
        errors.push(email)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} draft reminder email(s)`,
      count: sentCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in draft reminders cron:', error)
    return NextResponse.json(
      { error: 'Failed to process draft reminders' },
      { status: 500 }
    )
  }
}
