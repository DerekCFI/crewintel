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
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.log('Slack notification skipped: SLACK_WEBHOOK_URL not configured');
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
      console.error('Slack webhook returned non-OK status:', response.status);
    }
  } catch (error) {
    console.error('Failed to send Slack feedback notification:', error);
  }
}
