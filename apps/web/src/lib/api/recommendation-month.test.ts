import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveRecommendationMonths } from './recommendation-month.ts';

describe('resolveRecommendationMonths', () => {
  it('shows a 12-month-old month 12, not 18 (the PM defect)', () => {
    assert.deepEqual(resolveRecommendationMonths(12.4), { babyMonth: 12, month: 12 });
  });

  it('follows the baby for other ages too', () => {
    assert.equal(resolveRecommendationMonths(3.1).month, 3);
    assert.equal(resolveRecommendationMonths(0.2).month, 0);
  });

  it('lets the parent browse another month without changing the baby month', () => {
    assert.deepEqual(resolveRecommendationMonths(12.4, 18), { babyMonth: 12, month: 18 });
  });

  it('clamps to 0-24', () => {
    assert.equal(resolveRecommendationMonths(30).babyMonth, 24);
    assert.equal(resolveRecommendationMonths(12, 99).month, 24);
    assert.equal(resolveRecommendationMonths(12, -3).month, 0);
  });

  it('falls back to the baby month when the selection is not a number', () => {
    assert.equal(resolveRecommendationMonths(12.4, Number.NaN).month, 12);
  });
});
