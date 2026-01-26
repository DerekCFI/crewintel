/**
 * Email Notification System using Resend
 */

const ADMIN_EMAIL = 'derek@crewintel.org'

interface ReviewNotification {
  id: number
  locationName: string
  category: string
  airportCode: string
  overallRating: number
  reviewText: string
  userEmail: string | null
  isNewLocation: boolean
  spamScore: number
  spamReasons: string[]
  autoFlagged: boolean
}

interface LocationNotification {
  id: number
  locationName: string
  category: string
  airportCode: string
  address: string
}

export async function sendNewReviewNotification(review: ReviewNotification): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email notification')
    return false
  }

  try {
    const categoryLabels: Record<string, string> = {
      hotels: 'Hotel',
      fbos: 'FBO',
      restaurants: 'Restaurant',
      rentals: 'Car Rental'
    }

    const stars = '★'.repeat(review.overallRating) + '☆'.repeat(5 - review.overallRating)

    // Determine urgency based on spam detection
    let subjectPrefix = ''
    let alertHtml = ''

    if (review.autoFlagged) {
      subjectPrefix = '🚨 [AUTO-FLAGGED] '
      alertHtml = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; margin-bottom: 16px; border-radius: 8px;">
          <strong style="color: #dc2626;">⚠️ Auto-flagged as potential spam (Score: ${review.spamScore}/100)</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #7f1d1d;">
            ${review.spamReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `
    } else if (review.spamScore >= 30) {
      subjectPrefix = '⚠️ [NEEDS REVIEW] '
      alertHtml = `
        <div style="background: #fefce8; border: 1px solid #fef08a; padding: 12px; margin-bottom: 16px; border-radius: 8px;">
          <strong style="color: #a16207;">⚠️ Suspicious content detected (Score: ${review.spamScore}/100)</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #78350f;">
            ${review.spamReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `
    }

    const newLocationBadge = review.isNewLocation
      ? '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">NEW LOCATION</span>'
      : ''

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
        <h2 style="color: #1e40af; margin-bottom: 8px;">
          New ${categoryLabels[review.category] || review.category} Review ${newLocationBadge}
        </h2>

        ${alertHtml}

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px 0;">${review.locationName}</h3>
          <p style="margin: 0; color: #64748b;">${review.airportCode} • ${categoryLabels[review.category] || review.category}</p>
          <p style="margin: 8px 0 0 0; font-size: 20px;">${stars}</p>
        </div>

        <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0; line-height: 1.6;">${review.reviewText.replace(/\n/g, '<br>')}</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">
          <strong>Submitted by:</strong> ${review.userEmail || 'Anonymous'}<br>
          <strong>Review ID:</strong> ${review.id}
        </p>

        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://crewintel.org'}/admin"
             style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Open Admin Panel
          </a>
        </div>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CrewIntel <notifications@crewintel.org>',
        to: ADMIN_EMAIL,
        subject: `${subjectPrefix}New review: ${review.locationName} (${stars})`,
        html
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

export async function sendNewLocationNotification(location: LocationNotification): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email notification')
    return false
  }

  try {
    const categoryLabels: Record<string, string> = {
      hotels: 'Hotel',
      fbos: 'FBO',
      restaurants: 'Restaurant',
      rentals: 'Car Rental'
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
        <h2 style="color: #1e40af; margin-bottom: 8px;">
          🆕 New ${categoryLabels[location.category] || location.category} Added
        </h2>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; margin-bottom: 16px; border-radius: 8px;">
          <strong style="color: #92400e;">Pending your approval</strong>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px 0;">${location.locationName}</h3>
          <p style="margin: 0; color: #64748b;">${location.airportCode} • ${categoryLabels[location.category] || location.category}</p>
          <p style="margin: 8px 0 0 0; color: #475569;">${location.address}</p>
        </div>

        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://crewintel.org'}/admin"
             style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
            Review & Approve
          </a>
        </div>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CrewIntel <notifications@crewintel.org>',
        to: ADMIN_EMAIL,
        subject: `🆕 New location pending approval: ${location.locationName}`,
        html
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}
