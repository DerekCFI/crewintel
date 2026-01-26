'use client';

import { useEffect } from 'react';
import { notifySlackError } from '@/app/lib/slack-notify';
import { useUser } from '@clerk/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useUser();

  useEffect(() => {
    // Log error to Slack
    notifySlackError(error, {
      userId: user?.id,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      page: window.location.pathname,
      component: 'Global Error Boundary',
      additionalInfo: {
        digest: error.digest,
        userAgent: navigator.userAgent
      }
    });
  }, [error, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">
          We've been notified and are looking into it.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
