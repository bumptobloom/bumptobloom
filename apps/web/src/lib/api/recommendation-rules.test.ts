import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AGE_BUCKETS,
  MIN_PRODUCTS_PER_AGE,
  bucketForAge,
  findCoverageGaps,
  selectProductIds,
  wholeMonthAge,
  type RecommendationRule,
} from './recommendation-rules.ts';

/** Four products per bucket, the shape the #41 catalog seed uses. */
function catalogShapedRules(): RecommendationRule[] {
  const rules: RecommendationRule[] = [];
  for (const bucket of AGE_BUCKETS) {
    for (let i = 0; i < 4; i++) {
      rules.push({
        productId: `${bucket.minAgeMonth}-${bucket.maxAgeMonth}-product-${i}`,
        minAgeMonth: bucket.minAgeMonth,
        maxAgeMonth: bucket.maxAgeMonth,
        priority: 10 - i,
      });
    }
  }
  return rules;
}

// ---------------------------------------------------------------- buckets

test('the four buckets cover every whole month 0–24 exactly once', () => {
  for (let month = 0; month <= 24; month++) {
    const matches = AGE_BUCKETS.filter((b) => month >= b.minAgeMonth && month <= b.maxAgeMonth);
    assert.equal(matches.length, 1, `month ${month} is in ${matches.length} buckets`);
  }
});

test('bucket edges fall where the issue says: 0-3, 4-8, 9-14, 15-24', () => {
  assert.equal(bucketForAge(0).label, '0–3 months');
  assert.equal(bucketForAge(3).label, '0–3 months');
  assert.equal(bucketForAge(4).label, '4–8 months');
  assert.equal(bucketForAge(8).label, '4–8 months');
  assert.equal(bucketForAge(9).label, '9–14 months');
  assert.equal(bucketForAge(14).label, '9–14 months');
  assert.equal(bucketForAge(15).label, '15–24 months');
  assert.equal(bucketForAge(24).label, '15–24 months');
});

test('a part-month age stays in the month she is in, not the one she is nearing', () => {
  assert.equal(wholeMonthAge(3.9), 3);
  assert.equal(bucketForAge(3.9).label, '0–3 months');
  assert.equal(bucketForAge(4.0).label, '4–8 months');
});

test('out-of-range or broken ages are kept inside 0–24 instead of failing', () => {
  assert.equal(wholeMonthAge(-1), 0);
  assert.equal(wholeMonthAge(30), 24);
  assert.equal(wholeMonthAge(Number.NaN), 0);
});

// -------------------------------------------------------------- selection

test('every age 0–24 returns at least three products (#42 done-when)', () => {
  const rules = catalogShapedRules();
  assert.deepEqual(findCoverageGaps(rules), []);
  for (let month = 0; month <= 24; month++) {
    assert.ok(selectProductIds(month, rules).length >= MIN_PRODUCTS_PER_AGE);
  }
});

test('changing the baby’s age changes the list (#42 done-when)', () => {
  const rules = catalogShapedRules();
  const lists = AGE_BUCKETS.map((b) => selectProductIds(b.minAgeMonth, rules).join(','));
  assert.equal(new Set(lists).size, AGE_BUCKETS.length);
});

test('products come back highest priority first', () => {
  const rules: RecommendationRule[] = [
    { productId: 'low', minAgeMonth: 0, maxAgeMonth: 3, priority: 1 },
    { productId: 'high', minAgeMonth: 0, maxAgeMonth: 3, priority: 9 },
    { productId: 'mid', minAgeMonth: 0, maxAgeMonth: 3, priority: 5 },
  ];
  assert.deepEqual(selectProductIds(2, rules), ['high', 'mid', 'low']);
});

test('no duplicates in one list, even when two rules match one product (#42 done-when)', () => {
  const rules: RecommendationRule[] = [
    { productId: 'teether', minAgeMonth: 0, maxAgeMonth: 8, priority: 2 },
    { productId: 'teether', minAgeMonth: 4, maxAgeMonth: 8, priority: 7 },
    { productId: 'cup', minAgeMonth: 4, maxAgeMonth: 8, priority: 5 },
  ];
  const ids = selectProductIds(6, rules);
  assert.deepEqual(ids, ['teether', 'cup']); // once, at its higher priority
  assert.equal(new Set(ids).size, ids.length);
});

test('equal priorities keep a stable order between loads', () => {
  const rules: RecommendationRule[] = [
    { productId: 'b', minAgeMonth: 0, maxAgeMonth: 24, priority: 3 },
    { productId: 'a', minAgeMonth: 0, maxAgeMonth: 24, priority: 3 },
  ];
  assert.deepEqual(selectProductIds(10, rules), ['a', 'b']);
  assert.deepEqual(selectProductIds(10, [...rules].reverse()), ['a', 'b']);
});

test('a catalog with too few products is reported month by month', () => {
  const thin: RecommendationRule[] = [
    { productId: 'x', minAgeMonth: 0, maxAgeMonth: 24, priority: 1 },
    { productId: 'y', minAgeMonth: 0, maxAgeMonth: 3, priority: 1 },
    { productId: 'z', minAgeMonth: 0, maxAgeMonth: 3, priority: 1 },
  ];
  const gaps = findCoverageGaps(thin);
  assert.equal(gaps[0].ageMonth, 4); // 0–3 has three, month 4 onwards has one
  assert.equal(gaps.length, 21);
  assert.ok(gaps.every((g) => g.productCount === 1));
});
