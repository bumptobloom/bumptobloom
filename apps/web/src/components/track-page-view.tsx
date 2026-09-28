'use client';

import { useEffect } from 'react';
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics';

/**
 * Fires one analytics event when a screen opens. Screens are server
 * components, and analytics only runs in the browser, so a server page drops
 * this in to record that it was viewed. Renders nothing.
 */
export function TrackPageView({
  event,
  properties,
}: {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    trackEvent(event, properties);
    // Fire once per mount; a new month or product remounts with new props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, JSON.stringify(properties ?? {})]);

  return null;
}
