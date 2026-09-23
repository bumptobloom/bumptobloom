'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { ErrorState } from '@/components/error-state';

/** How long a load is allowed to take before she is told it is slow. */
const SLOW_AFTER_MS = 8000;

/**
 * Figma frame "03 Home, Error: Timeout (slow load)".
 *
 * There is no real timeout to hook into here: a server component that is still
 * streaming has not failed, it is just slow. So this is the normal loading
 * state that turns into the designed slow-load screen once it has been waiting
 * long enough to be worth saying something about.
 *
 * Retry reloads rather than router.refresh(), because the usual cause is a
 * request that is never coming back and refresh would queue behind it.
 */
export default function AppLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (slow) {
    return (
      <ErrorState
        icon={<Clock className="size-16" aria-hidden strokeWidth={1.5} />}
        title="This is taking longer than usual"
        body="Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[60vh] flex-col items-center justify-center"
    >
      <span className="size-[180px] animate-pulse rounded-full bg-[var(--surface-moss)]" />
    </div>
  );
}
