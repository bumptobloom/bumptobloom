/**
 * Age derivation utilities for BumpToBloom.
 *
 * Implements ADR-004: birth_date is stored as a date, age is always derived server-side
 * or at fetch time, and NEVER cached across days.
 *
 * Formula matches Supabase SQL baby_age_months():
 * extract(epoch from (now() - birth_date)) / 2629746.0 (seconds in average Gregorian month)
 */

export const SECONDS_PER_MONTH = 2629746.0;
export const MS_PER_MONTH = SECONDS_PER_MONTH * 1000;
export const MS_PER_DAY = 86400000;

// Clinically, preterm correction applies for babies born before 37 weeks (>= 21 days before due date)
export const PRETERM_THRESHOLD_DAYS = 21;

export interface AgeOptions {
  dueDate?: string | Date | null;
  referenceDate?: Date;
}

export interface BabyAgeResult {
  ageMonths: number;
  ageLabel: string;
  chronologicalAgeMonths: number;
  correctedAgeMonths: number | null;
  isPreterm: boolean;
}

/**
 * Parses date input into a clean UTC or standard Date object.
 */
function parseDate(input: string | Date): Date {
  if (input instanceof Date) {
    return input;
  }
  // YYYY-MM-DD string parsing (avoid timezone shifting issues by setting UTC midnight or local)
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  return new Date(input);
}

/**
 * Formats a parent-friendly age label.
 * - < 1 month: "Newborn" or "X weeks"
 * - 1 to 2 months: "1 month"
 * - >= 2 months: "X months"
 */
export function formatAgeLabel(ageMonths: number, diffDays?: number): string {
  if (ageMonths <= 0 || (diffDays !== undefined && diffDays < 7)) {
    return 'Newborn';
  }

  if (diffDays !== undefined && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    if (weeks <= 0) return 'Newborn';
    if (weeks === 1) return '1 week';
    return `${weeks} weeks`;
  }

  if (ageMonths < 1) {
    return 'Newborn';
  }

  const floorMonths = Math.floor(ageMonths);
  if (floorMonths === 1) {
    return '1 month';
  }

  return `${floorMonths} months`;
}

/**
 * Comprehensive age derivation utility returning developmental ageMonths, ageLabel, and preterm details.
 *
 * NOTE FOR PRODUCT & UI DEVELOPERS:
 * - `ageMonths` returns the developmental (corrected) age for preterm babies (born >= 21 days early),
 *   which is clinically appropriate for developmental milestone checkpoints and guidance.
 * - `chronologicalAgeMonths` is the real chronological age since birth.
 *   Displaying developmental age vs chronological age to the parent is a product decision (e.g. displaying
 *   chronological age with an explanatory label for milestone adjustment).
 *
 * NOTE ON DATABASE ALIGNMENT:
 * - The Supabase SQL function `baby_age_months()` calculates pure chronological age without preterm correction.
 *   Therefore, the database value and the app's developmental `ageMonths` will intentionally differ for preterm babies.
 */
export function calculateBabyAge(
  birthDateInput: string | Date,
  options?: AgeOptions
): BabyAgeResult {
  const ref = options?.referenceDate ?? new Date();
  const birthDate = parseDate(birthDateInput);

  if (birthDate.getTime() > ref.getTime()) {
    throw new Error('Birth date cannot be in the future');
  }

  const chronoDiffMs = Math.max(0, ref.getTime() - birthDate.getTime());
  const chronoDays = Math.floor(chronoDiffMs / MS_PER_DAY);
  const chronologicalAgeMonths = Math.round((chronoDiffMs / MS_PER_MONTH) * 10) / 10;

  let isPreterm = false;
  let correctedAgeMonths: number | null = null;
  let activeAgeMonths = chronologicalAgeMonths;

  if (options?.dueDate) {
    const dueDate = parseDate(options.dueDate);
    const earlyDiffMs = dueDate.getTime() - birthDate.getTime();
    const earlyDays = Math.floor(earlyDiffMs / MS_PER_DAY);

    // Only apply correction if born at least 21 days (3 weeks) before due date (< 37 weeks gestational age)
    if (earlyDays >= PRETERM_THRESHOLD_DAYS) {
      isPreterm = true;
      const correctedDiffMs = ref.getTime() - dueDate.getTime();
      correctedAgeMonths = Math.max(0, Math.round((correctedDiffMs / MS_PER_MONTH) * 10) / 10);
      activeAgeMonths = correctedAgeMonths;
    }
  }

  const ageLabel = formatAgeLabel(activeAgeMonths, chronoDays);

  return {
    ageMonths: activeAgeMonths,
    ageLabel,
    chronologicalAgeMonths,
    correctedAgeMonths,
    isPreterm,
  };
}

/**
 * Derives baby age in months rounded to 1 decimal place.
 * Delegates directly to calculateBabyAge to ensure a single source of truth.
 *
 * @param birthDateInput - Birth date string (YYYY-MM-DD) or Date
 * @param options - Optional due date for preterm correction and reference date
 * @returns Age in months (e.g. 0.0, 18.3, 23.0)
 */
export function deriveAgeMonths(
  birthDateInput: string | Date,
  options?: AgeOptions
): number {
  return calculateBabyAge(birthDateInput, options).ageMonths;
}
