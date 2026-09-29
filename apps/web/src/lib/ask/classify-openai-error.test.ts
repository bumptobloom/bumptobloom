import test from 'node:test';
import assert from 'node:assert/strict';
import OpenAI from 'openai';
import { classifyOpenAIError } from './classify-openai-error.ts';

const PARENT_TEXT = 'my baby has a rash on her back and I am scared';

test('a timeout is classified as ask_timeout', () => {
  const result = classifyOpenAIError(new OpenAI.APIConnectionTimeoutError());

  assert.equal(result.eventType, 'ask_timeout');
  assert.deepEqual(result.payload, { errorKind: 'timeout' });
});

test('a connection failure is an upstream error, not a timeout', () => {
  const result = classifyOpenAIError(new OpenAI.APIConnectionError({ message: 'socket hang up' }));

  assert.equal(result.eventType, 'ask_upstream_error');
  assert.deepEqual(result.payload, { errorKind: 'connection' });
});

test('an API error keeps only status and code, never the message', () => {
  const err = OpenAI.APIError.generate(
    400,
    {
      error: {
        message: `Rejected: "${PARENT_TEXT}"`,
        code: 'content_policy_violation',
        type: 'invalid_request_error',
      },
    },
    `Rejected: "${PARENT_TEXT}"`,
    new Headers(),
  );
  assert.ok(err.message.includes('rash'), 'precondition: the raw message does carry the parent text');

  const result = classifyOpenAIError(err);

  assert.equal(result.eventType, 'ask_upstream_error');
  assert.deepEqual(result.payload, { errorKind: 'api', status: 400, code: 'content_policy_violation' });
  assert.ok(!JSON.stringify(result).includes('rash'), 'no part of the parent text may appear in the result');
});

test('a code that is not identifier-shaped is dropped', () => {
  const err = OpenAI.APIError.generate(
    400,
    { error: { message: 'x', code: PARENT_TEXT } },
    'x',
    new Headers(),
  );
  assert.equal(err.code, PARENT_TEXT, 'precondition: the SDK kept the free-text code');

  const result = classifyOpenAIError(err);

  assert.equal(result.payload.errorKind, 'api');
  assert.equal(result.payload.code, undefined);
  assert.ok(!JSON.stringify(result).includes('rash'));
});

test('a non-OpenAI error is classified as unknown and leaks nothing', () => {
  const result = classifyOpenAIError(new Error(PARENT_TEXT));

  assert.equal(result.eventType, 'ask_upstream_error');
  assert.deepEqual(result.payload, { errorKind: 'unknown' });
  assert.ok(!JSON.stringify(result).includes('rash'));
});
