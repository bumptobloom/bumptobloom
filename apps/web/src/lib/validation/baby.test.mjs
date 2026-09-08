import test from 'node:test';
import assert from 'node:assert/strict';

import { validateBabyInput } from './baby.ts';

test('accepts a valid baby profile', () => {
  const result = validateBabyInput({
    name: 'Emma',
    birthDate: '2026-01-10',
    dueDate: null,
  });

  assert.deepEqual(result, {
    name: 'Emma',
    birthDate: '2026-01-10',
    dueDate: null,
  });
});

test('rejects a future birth date', () => {
  const future = new Date();
  future.setDate(future.getDate() + 1);

  const birthDate = future.toISOString().slice(0, 10);

  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate,
      }),
    /Birth date cannot be in the future/
  );
});

test('rejects a birth date outside the 0–24 month range', () => {
  const oldestAllowed = new Date();
  oldestAllowed.setMonth(oldestAllowed.getMonth() - 25);

  const birthDate = oldestAllowed.toISOString().slice(0, 10);

  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate,
      }),
    /Birth date is outside the 0–24 month range/
  );
});

test('requires a baby name', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: '   ',
        birthDate: '2026-01-10',
      }),
    /Baby name is required/
  );
});
