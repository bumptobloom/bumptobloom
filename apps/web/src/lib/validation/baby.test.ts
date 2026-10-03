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

/**
 * A UTC date exactly `months` whole months before today, day-of-month clamped
 * to the target month's length.
 *
 * Deliberately not the implementation's own arithmetic. The previous version
 * of this test built its fixture with `setMonth(getMonth() - 25)` and
 * `toISOString()` - the same computation the validator used, except
 * toISOString is UTC while the validator parsed local. In any timezone behind
 * UTC the fixture landed a day later than the cutoff, so nothing threw and the
 * test failed. CI runs in UTC and never saw it; it only failed on a laptop in
 * Pacific, in the evening.
 */
function utcMonthsAgo(months: number): string {
  const now = new Date();
  const day = now.getUTCDate();
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, 1));
  const lastDayOfTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDayOfTarget));
  return target.toISOString().slice(0, 10);
}

test('rejects a birth date outside the 0–24 month range', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate: utcMonthsAgo(25),
      }),
    /Birth date is outside the 0–24 month range/
  );
});

test('rejects a birth date well outside the range', () => {
  assert.throws(
    () =>
      validateBabyInput({
        name: 'Emma',
        birthDate: utcMonthsAgo(40),
      }),
    /Birth date is outside the 0–24 month range/
  );
});

test('accepts the oldest baby the app supports', () => {
  // The positive control. Without it, a validator that rejected every date
  // would pass the two tests above.
  const result = validateBabyInput({
    name: 'Emma',
    birthDate: utcMonthsAgo(24),
  });
  assert.equal(result.birthDate, utcMonthsAgo(24));
});

test('accepts a baby born today', () => {
  const today = new Date().toISOString().slice(0, 10);
  const result = validateBabyInput({ name: 'Emma', birthDate: today });
  assert.equal(result.birthDate, today);
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
