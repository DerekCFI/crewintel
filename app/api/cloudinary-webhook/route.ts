import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Verify this is from Cloudinary (check for expected fields)
    if (!payload.notification_type) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Format message for Slack based on notification type
    let slackMessage;
    
    if (payload.notification_type === 'upload') {
      // Photo was uploaded successfully
      slackMessage = {
        text: "📸 Image Upload Activity",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*New image uploaded to CrewIntel*\n` +
                    `Public ID: ${payload.public_id}\n` +
                    `Format: ${payload.format}\n` +
                    `Size: ${(payload.bytes / 1024).toFixed(2)} KB\n` +
                    `Uploaded by: ${payload.context?.custom?.userId || 'Unknown user'}`
            }
          }
        ]
      };
    } else if (payload.notification_type === 'upload_error') {
      // Upload failed
      slackMessage = {
        text: "🚨 Cloudinary Upload Error",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Image Upload Failed*\n` +
                    `Error: ${payload.error?.message || 'Unknown error'}\n` +
                    `This needs attention!`
            }
          }
        ]
      };
    } else if (payload.notification_type === 'resource_backup') {
      // Storage quota warning
      slackMessage = {
        text: "⚠️ Cloudinary Storage Alert",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Storage usage update*\n` +
                    `Current usage: ${payload.usage_percent}%\n` +
                    `Consider reviewing uploaded images.`
            }
          }
        ]
      };
    }
    
    // Send to Slack if we have a message
    if (slackMessage) {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      
      if (!slackWebhookUrl) {
        console.error('SLACK_WEBHOOK_URL not configured');
        return NextResponse.json({ error: 'Slack webhook not configured' }, { status: 500 });
      }

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    }
    
    // Always return success to Cloudinary
    return NextResponse.json({ success: true, received: payload.notification_type });
    
  } catch (error) {
    console.error('Cloudinary webhook error:', error);
    
    // Try to notify Slack about the webhook failure
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '🚨 Cloudinary webhook processing failed',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Webhook Error*\n${error instanceof Error ? error.message : 'Unknown error'}`
                }
              }
            ]
          })
        });
      }
    } catch (slackError) {
      console.error('Failed to notify Slack of webhook error:', slackError);
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Optional: Add a GET handler to test if the endpoint is working
export async function GET() {
  return NextResponse.json({ 
    message: 'Cloudinary webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
