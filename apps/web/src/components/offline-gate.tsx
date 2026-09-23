'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { WifiOff } from 'lucide-react';
import { ErrorState } from '@/components/error-state';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

/**
 * There is no connection to report while rendering on the server, and
 * assuming offline would flash the error screen on every first paint.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Figma frame "03 Home, Error: No internet connection".
 *
 * The frame promises "we'll reload automatically when you're back", so coming
 * back online reloads rather than only offering the button. The button stays
 * for the case where the browser believes it is online and the request still
 * fails.
 *
 * This reports the browser's view of the connection, which is not the same as
 * whether our server is reachable. A captive portal reads as online.
 */
export function OfflineGate({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }

    if (wasOffline.current) {
      window.location.reload();
    }
  }, [online]);

  if (!online) {
    return (
      <ErrorState
        icon={<WifiOff className="size-16" aria-hidden strokeWidth={1.5} />}
        title={'You’re offline'}
        body={'Check your connection and we’ll reload automatically when you’re back.'}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return <>{children}</>;
}
