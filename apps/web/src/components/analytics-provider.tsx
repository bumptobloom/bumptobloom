'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { scrubAnalyticsEvent } from '@/lib/analytics-privacy';

/**
 * Starts PostHog in the browser (#50), deliberately narrowly:
 * - autocapture off: it records every click with the clicked element's text
 *   and the full page URL, which could include a baby's name or an id.
 * - automatic pageviews off: screens send named events through trackEvent.
 * - session recording off: it would capture everything on screen.
 * - person_profiles identified_only: we never call identify, so no personal
 *   profile is created.
 * - before_send strips query strings and fragments from every URL.
 * Does nothing unless NEXT_PUBLIC_POSTHOG_KEY is set.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      person_profiles: 'identified_only',
      before_send: scrubAnalyticsEvent,
    });
  }, []);

  return <>{children}</>;
}
