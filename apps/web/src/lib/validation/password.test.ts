import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PASSWORD_MIN_LENGTH,
  validatePassword,
  validatePasswordConfirmation,
} from './password.ts';

/** assert.match takes a string; these validators return string | null. */
function message(result: string | null): string {
  assert.notEqual(result, null, 'expected a validation error, got null');
  return result as string;
}

test('accepts a password meeting PRD US-01: 8+ chars, a letter and a number', () => {
  assert.equal(validatePassword('bloom123'), null);
  assert.equal(validatePassword('A1bcdefg'), null);
  assert.equal(validatePassword('a'.repeat(50) + '1'), null);
});

test('rejects a password shorter than the minimum', () => {
  assert.match(message(validatePassword('bloom1')), /at least 8 characters/);
  assert.match(message(validatePassword('')), /at least 8 characters/);
  // Exactly at the boundary is acceptable, one under is not.
  assert.equal(validatePassword('abcdefg1'.slice(0, PASSWORD_MIN_LENGTH)), null);
  assert.notEqual(validatePassword('abcdef1'), null);
});

test('rejects a password with no number, or no letter', () => {
  assert.match(message(validatePassword('bloomflower')), /one letter and one number/);
  assert.match(message(validatePassword('12345678')), /one letter and one number/);
  // Symbols alone do not satisfy either requirement.
  assert.match(message(validatePassword('!@#$%^&*')), /one letter and one number/);
});

test('a symbol does not disqualify an otherwise valid password', () => {
  assert.equal(validatePassword('bloom!123'), null);
});

test('confirmation must match exactly', () => {
  assert.equal(validatePasswordConfirmation('bloom123', 'bloom123'), null);
  assert.match(message(validatePasswordConfirmation('bloom123', 'bloom124')), /do not match/);
  // Case and whitespace are significant -- a trimmed compare would let a
  // mother set a password she cannot then type back.
  assert.match(message(validatePasswordConfirmation('bloom123', 'Bloom123')), /do not match/);
  assert.match(message(validatePasswordConfirmation('bloom123', 'bloom123 ')), /do not match/);
});
