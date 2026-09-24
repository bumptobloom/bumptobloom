import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAskModelResponse } from './ask-response-schema.ts';

function validRawResponse(overrides = {}) {
  return {
    choices: [{ message: { content: 'Here is a warm, helpful answer.' } }],
    usage: { prompt_tokens: 120, completion_tokens: 45 },
    ...overrides,
  };
}

test('accepts a well-formed response and extracts answer + tokens', () => {
  const result = parseAskModelResponse(validRawResponse());
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.answer, 'Here is a warm, helpful answer.');
    assert.equal(result.inputTokens, 120);
    assert.equal(result.outputTokens, 45);
  }
});

test('tolerates unrelated extra fields OpenAI might add later', () => {
  const result = parseAskModelResponse(
    validRawResponse({ id: 'chatcmpl-abc', created: 12345, some_new_field: 'x' }),
  );
  assert.equal(result.ok, true);
});

test('rejects a response with no choices', () => {
  const result = parseAskModelResponse(validRawResponse({ choices: [] }));
  assert.equal(result.ok, false);
});

test('rejects a missing choices field entirely', () => {
  const raw = validRawResponse();
  delete (raw as any).choices;
  const result = parseAskModelResponse(raw);
  assert.equal(result.ok, false);
});

test('rejects null content', () => {
  const result = parseAskModelResponse(
    validRawResponse({ choices: [{ message: { content: null } }] }),
  );
  assert.equal(result.ok, false);
});

test('rejects empty-string content', () => {
  const result = parseAskModelResponse(
    validRawResponse({ choices: [{ message: { content: '' } }] }),
  );
  assert.equal(result.ok, false);
});

test('rejects whitespace-only content', () => {
  const result = parseAskModelResponse(
    validRawResponse({ choices: [{ message: { content: '   ' } }] }),
  );
  assert.equal(result.ok, false);
});

test('accepts a response missing usage entirely, tokens fall through as null', () => {
  const raw = validRawResponse();
  delete (raw as any).usage;
  const result = parseAskModelResponse(raw);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.inputTokens, null);
    assert.equal(result.outputTokens, null);
    assert.equal(result.answer, 'Here is a warm, helpful answer.');
  }
});

test('accepts a response with usage explicitly null, tokens fall through as null', () => {
  const result = parseAskModelResponse(validRawResponse({ usage: null }));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.inputTokens, null);
    assert.equal(result.outputTokens, null);
  }
});

test('rejects non-numeric token counts when usage IS present but malformed', () => {
  const result = parseAskModelResponse(
    validRawResponse({ usage: { prompt_tokens: 'a lot', completion_tokens: 45 } }),
  );
  assert.equal(result.ok, false);
});

test('rejects negative token counts when usage IS present but malformed', () => {
  const result = parseAskModelResponse(
    validRawResponse({ usage: { prompt_tokens: -1, completion_tokens: 45 } }),
  );
  assert.equal(result.ok, false);
});

test('rejects completely malformed input without throwing', () => {
  assert.doesNotThrow(() => parseAskModelResponse(null));
  assert.doesNotThrow(() => parseAskModelResponse(undefined));
  assert.doesNotThrow(() => parseAskModelResponse('not an object'));
  assert.doesNotThrow(() => parseAskModelResponse(42));
  assert.equal(parseAskModelResponse(null).ok, false);
});

test('failure reason is a non-empty, readable string', () => {
  const result = parseAskModelResponse({});
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.reason.length > 0);
  }
});
