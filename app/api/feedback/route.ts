import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { notifySlackFeedback } from '@/app/lib/slack-notify'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const { userId, name, email, type, message } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

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
      VALUES (${userId || null}, ${name.trim()}, ${email.trim()}, ${type}, ${message.trim()}, 'new', NOW())
      RETURNING id
    `

    // Send email notification (using Resend if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const typeLabels: Record<string, string> = {
          bug: 'Bug Report',
          feature: 'Feature Request',
          general: 'General Feedback',
          question: 'Question'
        }

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'CrewIntel Feedback <feedback@crewintel.org>',
            to: 'feedback@crewintel.org',
            subject: `[CrewIntel] New ${typeLabels[type] || type}: ${message.substring(0, 50)}...`,
            html: `
              <h2>New Feedback Received</h2>
              <p><strong>Type:</strong> ${typeLabels[type] || type}</p>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>User ID:</strong> ${userId || 'Not logged in'}</p>
              <hr>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Feedback ID: ${result[0].id}</small></p>
            `
          })
        })
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Failed to send email notification:', emailError)
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
        userName: name.trim(),
        userEmail: email.trim(),
        userId: userId || null
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
