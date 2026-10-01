/**
 * Recommendation rules by age bucket (#42). Pure logic, no Supabase.
 *
 * The rules themselves are rows in `product_recommendation_rules`
 * (product, min age, max age, priority), seeded with the catalog in #41.
 * This file decides what a baby of a given age sees, and in what order.
 */

export interface AgeBucket {
  minAgeMonth: number;
  maxAgeMonth: number;
  label: string;
}

/** The four MVP buckets. Every whole month from 0 to 24 is in exactly one. */
export const AGE_BUCKETS: readonly AgeBucket[] = [
  { minAgeMonth: 0, maxAgeMonth: 3, label: '0–3 months' },
  { minAgeMonth: 4, maxAgeMonth: 8, label: '4–8 months' },
  { minAgeMonth: 9, maxAgeMonth: 14, label: '9–14 months' },
  { minAgeMonth: 15, maxAgeMonth: 24, label: '15–24 months' },
];

/** Done-when on #42: every age 0–24 returns at least this many products. */
export const MIN_PRODUCTS_PER_AGE = 3;

export interface RecommendationRule {
  productId: string;
  minAgeMonth: number;
  maxAgeMonth: number;
  priority: number; // higher shows first
}

/**
 * Whole months, kept inside 0–24. A baby at 3.9 months is in her fourth month
 * and still in the 0–3 bucket; she moves to 4–8 on the day she turns 4 months.
 */
export function wholeMonthAge(ageMonths: number): number {
  if (!Number.isFinite(ageMonths)) return 0;
  return Math.min(24, Math.max(0, Math.floor(ageMonths)));
}

export function bucketForAge(ageMonths: number): AgeBucket {
  const month = wholeMonthAge(ageMonths);
  return (
    AGE_BUCKETS.find((b) => month >= b.minAgeMonth && month <= b.maxAgeMonth) ??
    AGE_BUCKETS[AGE_BUCKETS.length - 1]
  );
}

/**
 * The product ids a baby of this age should see, highest priority first.
 *
 * A product can match more than one rule (say, one for 0–8 and one for 4–8).
 * It appears once, at its highest matching priority. Ties break on product id
 * so the order is the same on every load.
 */
export function selectProductIds(ageMonths: number, rules: RecommendationRule[]): string[] {
  const month = wholeMonthAge(ageMonths);
  const best = new Map<string, number>();

  for (const rule of rules) {
    if (month < rule.minAgeMonth || month > rule.maxAgeMonth) continue;
    const current = best.get(rule.productId);
    if (current === undefined || rule.priority > current) {
      best.set(rule.productId, rule.priority);
    }
  }

  return [...best.entries()]
    .sort(([idA, prA], [idB, prB]) => prB - prA || idA.localeCompare(idB))
    .map(([id]) => id);
}

/**
 * Every whole month 0–24 that would get fewer than MIN_PRODUCTS_PER_AGE
 * products from these rules. An empty result means the catalog is complete.
 */
export function findCoverageGaps(
  rules: RecommendationRule[]
): { ageMonth: number; productCount: number }[] {
  const gaps: { ageMonth: number; productCount: number }[] = [];
  for (let month = 0; month <= 24; month++) {
    const count = selectProductIds(month, rules).length;
    if (count < MIN_PRODUCTS_PER_AGE) {
      gaps.push({ ageMonth: month, productCount: count });
    }
  }
  return gaps;
}
