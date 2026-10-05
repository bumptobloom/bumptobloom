/**
 * Works out which month Recommended for You should show.
 *
 * `babyMonth` is the child's own completed month, from her real age. `month`
 * is the one being viewed: the parent's selection if she tapped another month,
 * otherwise the baby's own. Both are whole months clamped to 0-24.
 *
 * This used to read the age from sample data, so every baby was treated as
 * 18 months old and a 12-month-old was shown 15-24 month products.
 */
function clampMonth(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(24, Math.max(0, Math.floor(value)));
}

export function resolveRecommendationMonths(
  babyAgeMonths: number,
  selectedMonth?: number,
): { babyMonth: number; month: number } {
  const babyMonth = clampMonth(babyAgeMonths);
  const month =
    selectedMonth === undefined || Number.isNaN(selectedMonth)
      ? babyMonth
      : clampMonth(selectedMonth);

  return { babyMonth, month };
}
