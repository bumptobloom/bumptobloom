'use client';

import { useEffect } from 'react';
import { CircleAlert } from 'lucide-react';
import { ErrorState } from '@/components/error-state';

/**
 * Figma frame "03 Home, Error: Something went wrong (500)".
 *
 * Covers every signed-in tab, because it sits at the top of the (app) group.
 *
 * Next 16 names the recovery prop `retry`. It was `reset` in 15, and the old
 * name silently does nothing, so do not rename it back.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Sentry is #227 and not merged yet. Until it is, this is the only record
    // that the screen was ever shown.
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <ErrorState
      icon={<CircleAlert className="size-16" aria-hidden strokeWidth={1.5} />}
      title="Something went wrong"
      body={'We’re having trouble loading this page. Please try again in a moment.'}
      actionLabel="Retry"
      onAction={retry}
    />
  );
}
