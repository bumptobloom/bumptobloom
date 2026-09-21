import type { ErrorEvent, EventHint } from '@sentry/nextjs';

/**
 * Strips personal and infant health data from Sentry events before they
 * leave the app.
 *
 * Per docs/SAFETY.md, fever/temperature readings, measurement method, red
 * flags and triage tier results are treated as sensitive infant health data,
 * stored under RLS and never used outside that table. Per issue #131, no
 * personal data may reach Sentry either.
 *
 * Conservative approach: rather than allow-listing which request body
 * fields are "safe", we drop the whole request body and any user PII. A
 * readable stack trace with line numbers does not need the body of the
 * request that triggered it.
 */
export function scrubPii(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
    // event.user.id is kept - useful for reproducing an issue, not
    // identifying, and does not include name/email/health data.
  }

  return event;
}
