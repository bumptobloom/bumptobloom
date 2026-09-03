import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBabyAge,
  deriveAgeMonths,
  formatAgeLabel,
  MS_PER_DAY,
  MS_PER_MONTH,
} from './age.ts';

test('age derivation for newborn (day 0)', () => {
  const ref = new Date(Date.UTC(2026, 8, 1)); // Sep 1, 2026
  const birthDate = new Date(Date.UTC(2026, 8, 1));
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 0);
  assert.equal(result.ageLabel, 'Newborn');
});

test('age derivation for 3-week-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 22));
  const birthDate = new Date(ref.getTime() - 21 * MS_PER_DAY);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 0.7);
  assert.equal(result.ageLabel, '3 weeks');
});

test('age derivation for 1-month-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 1 * MS_PER_MONTH);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 1.0);
  assert.equal(result.ageLabel, '1 month');
});

test('age derivation for 6-month-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 6 * MS_PER_MONTH);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 6.0);
  assert.equal(result.ageLabel, '6 months');
});

test('age derivation for 12-month-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 12 * MS_PER_MONTH);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 12.0);
  assert.equal(result.ageLabel, '12 months');
});

test('age derivation for 18.3-month-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 18.3 * MS_PER_MONTH);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 18.3);
  assert.equal(result.ageLabel, '18 months');
});

test('age derivation for 23-month-old', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 23 * MS_PER_MONTH);
  const result = calculateBabyAge(birthDate, { referenceDate: ref });

  assert.equal(result.ageMonths, 23.0);
  assert.equal(result.ageLabel, '23 months');
});

test('baby born 3 days early is NOT preterm (no correction applied)', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const dueDate = new Date(ref.getTime() - 4 * MS_PER_MONTH);
  const birthDate = new Date(dueDate.getTime() - 3 * MS_PER_DAY); // born only 3 days early (< 21 days)

  const result = calculateBabyAge(birthDate, { dueDate, referenceDate: ref });

  assert.equal(result.isPreterm, false);
  assert.equal(result.correctedAgeMonths, null);
  assert.equal(result.ageMonths, 4.1); // Uses chronological age
  assert.equal(result.chronologicalAgeMonths, 4.1);
});

test('post-term baby (due date earlier than birth date) is NOT preterm and has no negative age', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 4 * MS_PER_MONTH);
  const dueDate = new Date(birthDate.getTime() - 10 * MS_PER_DAY); // born 10 days after due date

  const result = calculateBabyAge(birthDate, { dueDate, referenceDate: ref });

  assert.equal(result.isPreterm, false);
  assert.equal(result.correctedAgeMonths, null);
  assert.equal(result.ageMonths, 4.0);
  assert.equal(result.chronologicalAgeMonths, 4.0);
});

test('corrected age for preterm baby born 8 weeks early (>= 21 days)', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const dueDate = new Date(ref.getTime() - 4 * MS_PER_MONTH); // 4 months since due date
  const birthDate = new Date(dueDate.getTime() - 8 * 7 * MS_PER_DAY); // born 8 weeks (56 days) early

  const result = calculateBabyAge(birthDate, { dueDate, referenceDate: ref });

  assert.equal(result.isPreterm, true);
  assert.equal(result.correctedAgeMonths, 4.0);
  assert.equal(result.ageMonths, 4.0); // Uses corrected age for milestones
  assert.equal(result.chronologicalAgeMonths, 5.8);
});

test('direct deriveAgeMonths unit tests with and without preterm correction', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const birthDate = new Date(ref.getTime() - 6 * MS_PER_MONTH);
  
  // Standard chronological
  assert.equal(deriveAgeMonths(birthDate, { referenceDate: ref }), 6.0);

  // Preterm (8 weeks early)
  const dueDate = new Date(ref.getTime() - 4 * MS_PER_MONTH);
  const pretermBirth = new Date(dueDate.getTime() - 56 * MS_PER_DAY);
  assert.equal(deriveAgeMonths(pretermBirth, { dueDate, referenceDate: ref }), 4.0);

  // 3 days early (no correction)
  const nearTermBirth = new Date(dueDate.getTime() - 3 * MS_PER_DAY);
  assert.equal(deriveAgeMonths(nearTermBirth, { dueDate, referenceDate: ref }), 4.1);
});

test('rejects future dates', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const futureBirth = new Date(Date.UTC(2026, 9, 1));

  assert.throws(() => {
    calculateBabyAge(futureBirth, { referenceDate: ref });
  }, /Birth date cannot be in the future/);
});
