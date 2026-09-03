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

test('corrected age for preterm baby born 8 weeks early', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const dueDate = new Date(ref.getTime() - 4 * MS_PER_MONTH); // 4 months since due date
  const birthDate = new Date(dueDate.getTime() - 8 * 7 * MS_PER_DAY); // born 8 weeks early

  const result = calculateBabyAge(birthDate, { dueDate, referenceDate: ref });

  assert.equal(result.isPreterm, true);
  assert.equal(result.correctedAgeMonths, 4.0);
  assert.equal(result.ageMonths, 4.0); // Uses corrected age for milestones
  assert.equal(result.chronologicalAgeMonths, 5.8);
});

test('rejects future dates', () => {
  const ref = new Date(Date.UTC(2026, 8, 1));
  const futureBirth = new Date(Date.UTC(2026, 9, 1));

  assert.throws(() => {
    calculateBabyAge(futureBirth, { referenceDate: ref });
  }, /Birth date cannot be in the future/);
});
