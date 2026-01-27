import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth, currentUser } from '@clerk/nextjs/server'
import { notifySlackFeedback } from '@/app/lib/slack-notify'

export async function POST(request: Request) {
  try {
    // Require authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user details from Clerk
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Extract user info from Clerk profile
    const name = user.fullName || user.firstName || 'Unknown User'
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || ''

    const body = await request.json()
    const { type, message } = body

    // Validate required fields
    if (!type || type.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback type is required' },
        { status: 400 }
      )
    }

    const validTypes = ['bug', 'feature', 'general', 'question']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Insert feedback into database
    const result = await sql`
      INSERT INTO feedback (user_id, name, email, type, message, status, created_at)
      VALUES (${userId}, ${name}, ${email}, ${type}, ${message.trim()}, 'new', NOW())
      RETURNING id
    `

    // Send email notification (using Resend if configured)
    console.log('Email notification: checking RESEND_API_KEY...', !!process.env.RESEND_API_KEY)
    if (process.env.RESEND_API_KEY) {
      try {
        const typeLabels: Record<string, string> = {
          bug: 'Bug Report',
          feature: 'Feature Request',
          general: 'General Feedback',
          question: 'Question'
        }

        console.log('Sending email notification for feedback type:', type, 'to: feedback@crewintel.org')

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CrewIntel Feedback <feedback@crewintel.org>',
            to: 'feedback@crewintel.org',
            subject: `[CrewIntel] New ${typeLabels[type] || type}: ${message.replace(/[\r\n]+/g, ' ').substring(0, 50)}...`,
            html: `
              <h2>New Feedback Received</h2>
              <p><strong>Type:</strong> ${typeLabels[type] || type}</p>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>User ID:</strong> ${userId}</p>
              <hr>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Feedback ID: ${result[0].id}</small></p>
            `
          })
        })

        // Check if Resend API returned an error
        if (!emailResponse.ok) {
          const errorBody = await emailResponse.text()
          console.error('Resend API error:', emailResponse.status, errorBody)
        } else {
          const emailResult = await emailResponse.json()
          console.log('Email sent successfully! Resend ID:', emailResult.id)
        }
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Failed to send email notification (network error):', emailError)
      }
    } else {
      // Log that email wasn't sent due to missing config
      console.log('Email notification skipped: RESEND_API_KEY not configured')
      console.log('New feedback received:', { id: result[0].id, type, name, email })
    }

    // Send Slack notification (awaited to ensure it completes before function terminates)
    try {
      await notifySlackFeedback({
        feedbackId: result[0].id,
        type: type as 'bug' | 'feature' | 'general' | 'question',
        message: message.trim(),
        userName: name,
        userEmail: email,
        userId: userId
      });
    } catch (slackError) {
      // Log but don't fail the request if Slack notification fails
      console.error('Slack notification error:', slackError);
    }

    return NextResponse.json({
      success: true,
      id: result[0].id
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
}
