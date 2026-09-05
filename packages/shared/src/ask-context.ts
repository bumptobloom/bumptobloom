/**
 * Privacy-safe baby context for the Ask model.
 *
 * This module deliberately accepts only a derived age. Birth date, due date,
 * baby ID, parent ID, name, and email must never enter the model context.
 */

export type DevelopmentalStage =
  | 'early infancy'
  | 'infancy'
  | 'late infancy'
  | 'toddlerhood';

export interface AskBabyContext {
  ageMonths: number;
  developmentalStage: DevelopmentalStage;
}

/**
 * Uses the same age buckets as the product recommendation rules:
 * 0–3, 4–8, 9–14, and 15–24 months.
 */
export function getDevelopmentalStage(
  ageMonths: number,
): DevelopmentalStage {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) {
    throw new RangeError('ageMonths must be a non-negative finite number');
  }

  if (ageMonths < 4) return 'early infancy';
  if (ageMonths < 9) return 'infancy';
  if (ageMonths < 15) return 'late infancy';

  return 'toddlerhood';
}

/**
 * Produces the complete baby-specific context permitted to reach OpenAI.
 *
 * Keep this return shape intentionally narrow. The caller may add the parent's
 * question separately, but must not add identifying baby or parent fields.
 */
export function buildAskBabyContext(
  ageMonths: number,
): Readonly<AskBabyContext> {
  return Object.freeze({
    ageMonths,
    developmentalStage: getDevelopmentalStage(ageMonths),
  });
}