interface ErrorContext {
  userId?: string;
  userEmail?: string;
  page?: string;
  component?: string;
  action?: string;
  additionalInfo?: Record<string, any>;
}

export async function notifySlackError(
  error: Error,
  context: ErrorContext
) {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error (dev):', error, context);
    return;
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) return;

  const message = {
    text: `🚨 Error in CrewIntel`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚨 Application Error"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Error:*\n${error.message}`
          },
          {
            type: "mrkdwn",
            text: `*Page:*\n${context.page || 'Unknown'}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*User:*\n${context.userEmail || 'Anonymous'}`
          },
          {
            type: "mrkdwn",
            text: `*Component:*\n${context.component || 'N/A'}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Stack Trace:*\n\`\`\`${error.stack?.slice(0, 500) || 'No stack trace'}\`\`\``
        }
      }
    ]
  };

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (slackError) {
    console.error('Failed to send Slack notification:', slackError);
  }
}

export async function notifySlackInfo(
  title: string,
  message: string,
  context?: Record<string, any>
) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) return;

  const slackMessage = {
    text: title,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${title}*\n${message}`
        }
      }
    ]
  };

  if (context) {
    slackMessage.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`${JSON.stringify(context, null, 2)}\`\`\``
      }
    });
  }

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

interface FeedbackNotification {
  feedbackId: number;
  type: 'bug' | 'feature' | 'general' | 'question';
  message: string;
  userName: string;
  userEmail: string;
  userId?: string | null;
}

export async function notifySlackFeedback(feedback: FeedbackNotification) {
  console.log('notifySlackFeedback called with type:', feedback.type, 'feedbackId:', feedback.feedbackId);

  // Channel-specific webhook URLs based on feedback type
  // Bug reports → #bug-reports channel
  // Feature requests & General feedback → #feedback channel
  // Questions → #questions channel
  const webhookMapping: Record<string, string | undefined> = {
    bug: process.env.SLACK_WEBHOOK_BUG_REPORTS,
    feature: process.env.SLACK_WEBHOOK_FEEDBACK,
    general: process.env.SLACK_WEBHOOK_FEEDBACK,
    question: process.env.SLACK_WEBHOOK_QUESTIONS
  };

  const slackWebhookUrl = webhookMapping[feedback.type] || process.env.SLACK_WEBHOOK_URL;

  const channelNames: Record<string, string> = {
    bug: '#bug-reports',
    feature: '#feedback',
    general: '#feedback',
    question: '#questions'
  };
  const targetChannel = channelNames[feedback.type] || '#dev-updates (fallback)';

  console.log('Slack target channel:', targetChannel, 'webhook configured:', !!slackWebhookUrl);

  if (!slackWebhookUrl) {
    console.log('Slack notification skipped: No webhook URL configured for type:', feedback.type);
    console.log('Required env var:', feedback.type === 'bug' ? 'SLACK_WEBHOOK_BUG_REPORTS' :
                feedback.type === 'question' ? 'SLACK_WEBHOOK_QUESTIONS' : 'SLACK_WEBHOOK_FEEDBACK');
    return;
  }

  const typeConfig: Record<string, { emoji: string; label: string }> = {
    bug: { emoji: '🐛', label: 'Bug Report' },
    feature: { emoji: '💡', label: 'Feature Request' },
    general: { emoji: '💬', label: 'General Feedback' },
    question: { emoji: '❓', label: 'Question' }
  };

  const config = typeConfig[feedback.type] || typeConfig.general;
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const slackMessage = {
    text: `${config.emoji} New ${config.label} from ${feedback.userName}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${config.emoji} New ${config.label}`,
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*From:*\n${feedback.userName}`
          },
          {
            type: "mrkdwn",
            text: `*Email:*\n${feedback.userEmail}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*User ID:*\n${feedback.userId || '_Not logged in_'}`
          },
          {
            type: "mrkdwn",
            text: `*Submitted:*\n${timestamp}`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message:*\n${feedback.message}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Feedback ID: ${feedback.feedbackId}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Slack webhook returned non-OK status:', response.status, responseText, 'channel:', targetChannel);
    } else {
      console.log('Slack notification sent successfully to', targetChannel, 'for feedback type:', feedback.type);
    }
  } catch (error) {
    console.error('Failed to send Slack feedback notification:', error);
    throw error; // Re-throw so the caller knows it failed
  }
}
