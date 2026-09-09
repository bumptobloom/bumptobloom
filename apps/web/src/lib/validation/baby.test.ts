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

test('accepts due date exactly 126 days after birth date', () => {
  assert.doesNotThrow(() =>
    validateBabyInput({
      name: 'Emma',
      birthDate: '2026-01-01',
      dueDate: '2026-05-07',
    })
  );
});

test('rejects due date 127 days after birth date', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate: '2026-01-01',
        dueDate: '2026-05-08',
      }),
    /Please check the due date, it looks too far from the birth date/
  );
});

test('accepts due date exactly 21 days before birth date', () => {
  assert.doesNotThrow(() =>
    validateBabyInput({
      name: 'Emma',
      birthDate: '2026-01-22',
      dueDate: '2026-01-01',
    })
  );
});

test('rejects due date 22 days before birth date', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate: '2026-01-23',
        dueDate: '2026-01-01',
      }),
    /Please check the due date, it looks too far from the birth date/
  );
});

test('rejects an invalid due date', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate: '2026-01-10',
        dueDate: 'not-a-date',
      }),
    /Please check the due date, it looks invalid/
  );
});
