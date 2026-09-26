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
 * Keeps only Sentry's own SDK metadata keys (sentry.op, sentry.origin,
 * sentry.source, sentry.sample_rate, ...). Everything else in span or trace
 * data - http.url, http.query, url.full, db statements - can carry IDs,
 * query parameters or user text, so it is dropped.
 */
function keepSentryKeys(data: Record<string, unknown> | undefined): Record<string, unknown> {
  const kept: Record<string, unknown> = {};
  if (!data) return kept;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('sentry.')) {
      kept[key] = value;
    }
  }
  return kept;
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
 * This is deliberately a strip-first function: every field that could
 * plausibly carry free-form user-entered text (exception messages,
 * breadcrumbs, tags, extra, contexts, query strings) is either removed or
 * reduced to structural information only. See scrub-pii.test.ts for
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
  // anything that could carry entered text.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb: Breadcrumb) => ({
      category: crumb.category,
      type: crumb.type,
      level: crumb.level,
      timestamp: crumb.timestamp,
    }));
  }

  // Free-form fields that could carry baby IDs, conversation IDs, product
  // IDs, health values, or arbitrary user text.
  delete event.tags;
  delete event.extra;

  // Contexts: drop everything except the trace context. Sentry treats a
  // transaction without contexts.trace as invalid and discards it, so the
  // trace context is kept - but only its structural ids and status, with
  // its data filtered to Sentry's own metadata keys.
  const trace = event.contexts?.trace;
  if (trace) {
    event.contexts = {
      trace: {
        trace_id: trace.trace_id,
        span_id: trace.span_id,
        parent_span_id: trace.parent_span_id,
        op: trace.op,
        status: trace.status,
        origin: trace.origin,
        data: keepSentryKeys(trace.data),
      },
    };
  } else {
    delete event.contexts;
  }

  return event;
}

export function scrubPii(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  scrubCommon(event);

  // Exception messages are the highest-risk field: AskUpstreamError wraps
  // the raw OpenAI provider error, which can echo the parent's question
  // back verbatim. Keep only the exception type and stack trace.
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

  // Spans can carry free-form values: request URLs with query strings, IDs,
  // or database query text in description and data. Keep the structural
  // timing information and Sentry's own metadata keys, drop the rest.
  if (event.spans) {
    for (const span of event.spans) {
      delete span.description;
      span.data = keepSentryKeys(span.data) as typeof span.data;
    }
  }

  return event;
}
