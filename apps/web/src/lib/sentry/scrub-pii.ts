import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import type { TransactionEvent, Breadcrumb } from '@sentry/core';

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
]);

function scrubHeaders(headers: Record<string, string> | undefined): void {
  if (!headers) return;
  for (const key of Object.keys(headers)) {
    if (SENSITIVE_HEADER_NAMES.has(key.toLowerCase())) {
      delete headers[key];
    }
  }
}

function stripQueryString(url: string | undefined): string | undefined {
  if (!url) return url;
  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
}

/**
 * Strips personal and infant health data from Sentry events before they
 * leave the app.
 *
 * Per docs/SAFETY.md, fever/temperature readings, measurement method, red
 * flags and triage tier results are treated as sensitive infant health data.
 * Per issue #131, no personal data may reach Sentry either - not even a
 * pseudonymous account id.
 *
 * This is deliberately a strip-first, not an allow-list-second, function:
 * every field that could plausibly carry free-form user-entered text
 * (exception messages, breadcrumbs, tags, extra, contexts, query strings)
 * is either removed or reduced to structural information only (type,
 * category, timestamp) with the content dropped. See scrub-pii.test.ts for
 * canary-value proof that nothing survives.
 */
function scrubCommon(event: ErrorEvent | TransactionEvent): ErrorEvent | TransactionEvent {
  // Request: drop the body entirely, strip the query string from the URL,
  // drop query_string directly, drop cookies, scrub headers case-insensitively.
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.query_string;
    event.request.url = stripQueryString(event.request.url);
    scrubHeaders(event.request.headers as Record<string, string> | undefined);
  }

  // User: remove the whole object. Even a stable UUID is pseudonymous
  // personal data per the issue's requirement - not just email/ip/username.
  delete event.user;

  // Breadcrumbs: keep the shape (category/type/level/timestamp) so the
  // sequence of events leading to an error is still visible, but drop
  // anything that could carry entered text - console log contents, fetch
  // URLs with query params, DOM click target text, etc.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb: Breadcrumb) => ({
      category: crumb.category,
      type: crumb.type,
      level: crumb.level,
      timestamp: crumb.timestamp,
    }));
  }

  // Free-form fields that could carry baby IDs, conversation IDs, product
  // IDs, health values, or arbitrary user text. None of this is essential
  // to reading a stack trace.
  delete event.tags;
  delete event.extra;
  delete event.contexts;

  return event;
}

export function scrubPii(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  scrubCommon(event);

  // Exception messages are the highest-risk field: AskUpstreamError wraps
  // the raw OpenAI provider error, which can echo the parent's question
  // back verbatim. Deleting the request body does not help here, since the
  // message already carries the text independently. Keep only the
  // exception type and stack trace - readable line numbers come from the
  // stack trace via source maps, not from the message string.
  if (event.exception?.values) {
    for (const exceptionValue of event.exception.values) {
      exceptionValue.value = '[message redacted - see stack trace]';
    }
  }

  // event.message is used by captureMessage(), which nothing in this app
  // currently calls, but scrub it defensively in case that changes.
  delete event.message;

  return event;
}

export function scrubPiiTransaction(event: TransactionEvent, _hint: EventHint): TransactionEvent {
  scrubCommon(event);
  return event;
}
