import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildModelCallRunRow } from './ai-run-log.ts';

const FAKE_MESSAGE_ID = '71000000-0000-4000-8000-000000000099';

test('model-call row has all required fields with correct values', () => {
  const row = buildModelCallRunRow({
    messageId: FAKE_MESSAGE_ID,
    promptVersion: '2026.09.2',
    model: 'gpt-4o-mini',
    inputTokens: 300,
    outputTokens: 80,
    latencyMs: 1450,
    validationOk: true,
  });

  assert.equal(row.message_id, FAKE_MESSAGE_ID);
  assert.equal(row.prompt_version, '2026.09.2');
  assert.equal(row.model, 'gpt-4o-mini');
  assert.equal(row.input_tokens, 300);
  assert.equal(row.output_tokens, 80);
  assert.equal(row.latency_ms, 1450);
  assert.equal(row.validation_ok, true);
  assert.equal(row.redirected_to_health, false);
});

test('records validation_ok=false accurately when validation failed', () => {
  const row = buildModelCallRunRow({
    messageId: FAKE_MESSAGE_ID,
    promptVersion: '2026.09.2',
    model: 'gpt-4o-mini',
    inputTokens: 300,
    outputTokens: 0,
    latencyMs: 900,
    validationOk: false,
  });
  assert.equal(row.validation_ok, false);
});

test('accepts null tokens for a failed call where usage itself was missing', () => {
  const row = buildModelCallRunRow({
    messageId: FAKE_MESSAGE_ID,
    promptVersion: '2026.09.2',
    model: 'gpt-4o-mini',
    inputTokens: null,
    outputTokens: null,
    latencyMs: 900,
    validationOk: false,
  });
  assert.equal(row.input_tokens, null);
  assert.equal(row.output_tokens, null);
  assert.equal(row.validation_ok, false);
});

test('redirected_to_health is always false — guard-blocked calls never use this builder', () => {
  const row = buildModelCallRunRow({
    messageId: FAKE_MESSAGE_ID,
    promptVersion: '2026.09.2',
    model: 'gpt-4o-mini',
    inputTokens: 10,
    outputTokens: 5,
    latencyMs: 100,
    validationOk: true,
  });
  assert.equal(row.redirected_to_health, false);
});

test('rejects a non-UUID message id rather than silently inserting garbage', () => {
  assert.throws(() =>
    buildModelCallRunRow({
      messageId: 'not-a-uuid',
      promptVersion: '2026.09.2',
      model: 'gpt-4o-mini',
      inputTokens: 10,
      outputTokens: 5,
      latencyMs: 100,
      validationOk: true,
    }),
  );
});

test('rejects a negative token count', () => {
  assert.throws(() =>
    buildModelCallRunRow({
      messageId: FAKE_MESSAGE_ID,
      promptVersion: '2026.09.2',
      model: 'gpt-4o-mini',
      inputTokens: -5,
      outputTokens: 5,
      latencyMs: 100,
      validationOk: true,
    }),
  );
});

test('rejects an empty prompt version', () => {
  assert.throws(() =>
    buildModelCallRunRow({
      messageId: FAKE_MESSAGE_ID,
      promptVersion: '',
      model: 'gpt-4o-mini',
      inputTokens: 10,
      outputTokens: 5,
      latencyMs: 100,
      validationOk: true,
    }),
  );
});
