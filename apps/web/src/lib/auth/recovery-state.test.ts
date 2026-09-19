import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveRecoveryState, type RecoveryInputs } from './recovery-state.ts';

const base: RecoveryInputs = {
  urlError: null,
  code: null,
  exchange: null,
  sawRecoveryEvent: false,
  timedOut: false,
};

test('a signed-in visitor with no recovery code cannot reach the form', () => {
  // The regression Keya caught: an ordinary session used to count as proof.
  // There is no "session" input at all now, which is the fix -- this case
  // cannot be made to pass by being logged in.
  assert.equal(resolveRecoveryState({ ...base }), 'invalid');
  assert.equal(resolveRecoveryState({ ...base, timedOut: true }), 'invalid');
});

test('an expired or already-used link is invalid, never a fallback to a session', () => {
  assert.equal(
    resolveRecoveryState({ ...base, urlError: 'Email link is invalid or has expired' }),
    'invalid',
  );
  // Supabase puts the error on the URL and sends no code.
  assert.equal(
    resolveRecoveryState({ ...base, urlError: 'access_denied', code: null }),
    'invalid',
  );
  // A code that fails to exchange and produces no recovery event is invalid
  // once we stop waiting -- it does not fall through to whatever session exists.
  assert.equal(
    resolveRecoveryState({ ...base, code: 'abc', exchange: 'failed', timedOut: true }),
    'invalid',
  );
});

test('a successful exchange verifies the attempt', () => {
  assert.equal(
    resolveRecoveryState({ ...base, code: 'abc', exchange: 'ok' }),
    'verified',
  );
});

test('PASSWORD_RECOVERY verifies the attempt even if our own exchange lost the race', () => {
  // detectSessionInUrl consumes the code first, so our exchange reports failed
  // while the event is the real proof.
  assert.equal(
    resolveRecoveryState({
      ...base,
      code: 'abc',
      exchange: 'failed',
      sawRecoveryEvent: true,
    }),
    'verified',
  );
});

test('stays pending while the answer is genuinely still unknown', () => {
  assert.equal(resolveRecoveryState({ ...base, code: 'abc' }), 'pending');
  assert.equal(
    resolveRecoveryState({ ...base, code: 'abc', exchange: 'failed' }),
    'pending',
  );
});

test('a URL error wins over every other signal', () => {
  assert.equal(
    resolveRecoveryState({
      ...base,
      urlError: 'expired',
      code: 'abc',
      exchange: 'ok',
      sawRecoveryEvent: true,
    }),
    'invalid',
  );
});
