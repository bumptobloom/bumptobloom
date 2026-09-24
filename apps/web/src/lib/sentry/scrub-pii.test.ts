import test from 'node:test';
import assert from 'node:assert/strict';

import { scrubPii, scrubPiiTransaction } from './scrub-pii.ts';

// Recognizable values that must never survive scrubbing, anywhere in the
// serialized event. Chosen to be unmistakable if they leak - nothing in a
// real event should ever contain these exact strings by coincidence.
const CANARY_QUESTION = 'CANARY_PARENT_QUESTION_should_the_fever_go_away';
const CANARY_TEMPERATURE = 'CANARY_TEMP_101_4F';
const CANARY_BABY_ID = 'CANARY_BABY_ID_abc789';
const CANARY_EMAIL = 'canary-parent@example.com';
const CANARY_COOKIE = 'CANARY_SESSION_COOKIE_VALUE';
const CANARY_AUTH = 'Bearer CANARY_AUTH_TOKEN_VALUE';
const CANARY_QUERY_PARAM = 'CANARY_QUERY_PARAM_VALUE';
const CANARY_USER_ID = 'CANARY_USER_UUID_11111111';

const ALL_CANARIES = [
  CANARY_QUESTION,
  CANARY_TEMPERATURE,
  CANARY_BABY_ID,
  CANARY_EMAIL,
  CANARY_COOKIE,
  CANARY_AUTH,
  CANARY_QUERY_PARAM,
  CANARY_USER_ID,
];

function buildErrorEvent() {
  return {
    message: `Failed to process: ${CANARY_QUESTION}`,
    exception: {
      values: [
        {
          type: 'AskUpstreamError',
          value: `Upstream provider echoed: ${CANARY_QUESTION} temp ${CANARY_TEMPERATURE}`,
          stacktrace: { frames: [{ filename: 'route.ts', lineno: 42 }] },
        },
      ],
    },
    request: {
      url: `https://example.com/api/ask?debug=${CANARY_QUERY_PARAM}`,
      query_string: `debug=${CANARY_QUERY_PARAM}`,
      data: JSON.stringify({ babyId: CANARY_BABY_ID, question: CANARY_QUESTION }),
      cookies: { session: CANARY_COOKIE },
      headers: {
        Authorization: CANARY_AUTH,
        authorization: CANARY_AUTH,
        Cookie: CANARY_COOKIE,
        cookie: CANARY_COOKIE,
        'Content-Type': 'application/json',
      },
    },
    user: {
      id: CANARY_USER_ID,
      email: CANARY_EMAIL,
      username: 'canary-username',
      ip_address: '1.2.3.4',
    },
    breadcrumbs: [
      {
        category: 'fetch',
        type: 'http',
        level: 'info',
        timestamp: 123,
        message: `Fetched with question=${CANARY_QUESTION}`,
        data: { url: `/api/ask?debug=${CANARY_QUERY_PARAM}` },
      },
    ],
    tags: { babyId: CANARY_BABY_ID },
    extra: { lastQuestion: CANARY_QUESTION },
    contexts: { custom: { temp: CANARY_TEMPERATURE } },
  };
}

function buildTransactionEvent() {
  return {
    type: 'transaction',
    transaction: '/api/ask',
    request: {
      url: `https://example.com/api/ask?debug=${CANARY_QUERY_PARAM}`,
      query_string: `debug=${CANARY_QUERY_PARAM}`,
      headers: { Authorization: CANARY_AUTH, cookie: CANARY_COOKIE },
    },
    user: { id: CANARY_USER_ID, email: CANARY_EMAIL },
    breadcrumbs: [
      { category: 'fetch', type: 'http', level: 'info', timestamp: 1, message: CANARY_QUESTION, data: {} },
    ],
    tags: { babyId: CANARY_BABY_ID },
    extra: { note: CANARY_TEMPERATURE },
    contexts: {},
  };
}

test('scrubPii removes every canary value from an error event', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  const serialized = JSON.stringify(result);

  for (const canary of ALL_CANARIES) {
    assert.equal(serialized.includes(canary), false, `canary leaked: ${canary}`);
  }
});

test('scrubPiiTransaction removes every canary value from a transaction event', () => {
  const result = scrubPiiTransaction(buildTransactionEvent() as never, {} as never);
  const serialized = JSON.stringify(result);

  for (const canary of ALL_CANARIES) {
    assert.equal(serialized.includes(canary), false, `canary leaked: ${canary}`);
  }
});

test('scrubPii keeps exception type and stack trace, only redacts the message', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  const values = result.exception?.values ?? [];

  assert.equal(values[0]?.type, 'AskUpstreamError');
  assert.ok(values[0]?.stacktrace);
  assert.equal(values[0]?.value, '[message redacted - see stack trace]');
});

test('scrubPii strips the query string from the URL but keeps the path', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  assert.equal(result.request?.url, 'https://example.com/api/ask');
});

test('scrubPii removes headers case-insensitively', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  const headers = result.request?.headers ?? {};
  assert.deepEqual(headers, { 'Content-Type': 'application/json' });
});

test('scrubPii removes the entire user object, including the id', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  assert.equal(result.user, undefined);
});

test('scrubPii keeps breadcrumb structure but drops message and data', () => {
  const result = scrubPii(buildErrorEvent() as never, {} as never);
  const crumb = result.breadcrumbs?.[0];
  assert.equal(crumb?.category, 'fetch');
  assert.equal(crumb?.type, 'http');
  assert.equal('message' in (crumb ?? {}), false);
  assert.equal('data' in (crumb ?? {}), false);
});

test('scrubPiiTransaction removes canary values from transaction spans', () => {
  const event = {
    ...buildTransactionEvent(),
    spans: [
      {
        span_id: 'span1',
        trace_id: 'trace1',
        start_timestamp: 1,
        timestamp: 2,
        op: 'http.client',
        description: `GET /api/ask?debug=${CANARY_QUERY_PARAM}&baby=${CANARY_BABY_ID}`,
        data: { url: `/api/ask?q=${CANARY_QUESTION}`, temp: CANARY_TEMPERATURE },
      },
    ],
  };

  const result = scrubPiiTransaction(event as never, {} as never);
  const serialized = JSON.stringify(result);

  for (const canary of ALL_CANARIES) {
    assert.equal(serialized.includes(canary), false, `canary leaked from span: ${canary}`);
  }

  // Structure survives so performance data is still useful.
  assert.equal(result.spans?.[0]?.op, 'http.client');
});
