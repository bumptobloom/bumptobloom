/**
 * BumpToBloom — Fever Triage Rules Engine
 * ----------------------------------------
 * Deterministic. No AI, no network, no randomness. Same inputs always produce
 * the same tier. This is a hard architectural rule: the Ask/OpenAI service must
 * never influence a triage result. See docs/SAFETY.md.
 *
 * ⚠️  CLINICAL REVIEW REQUIRED BEFORE LAUNCH
 * Every threshold below is an ENGINEERING PLACEHOLDER drawn from commonly
 * published pediatric guidance. None of it has been reviewed by a licensed
 * clinician. Triage advice going to frightened parents needs a doctor's
 * sign-off before release. Until the reviewer signs REVIEW.md, this module must
 * not ship to real users.
 *
 * Design principle: when inputs are ambiguous, escalate. Never de-escalate.
 */

export type Tier = 'HOME' | 'CALL' | 'EMERGENCY';

export type Method = 'rectal' | 'oral' | 'axillary' | 'temporal' | 'tympanic';

/** Red-flag symptoms. Any one of these forces EMERGENCY at any age or temp. */
export const RED_FLAGS = [
  'trouble_breathing',
  'blue_or_gray',
  'hard_to_wake',
  'stiff_neck',
  'non_blanching_rash',
  'under_3_wet_diapers',
  'inconsolable_2h',
  'seizure',
] as const;

export type RedFlag = (typeof RED_FLAGS)[number];

export interface FeverInput {
  /** Baby age in months, 0–24. Derived from birth_date, never entered by hand. */
  ageMonths: number;
  /** Temperature as measured, in °F. */
  tempF: number;
  /** How it was taken. Changes the rectal-equivalent conversion. */
  method: Method;
  redFlags: RedFlag[];
}

export interface FeverResult {
  tier: Tier;
  /** The rule that fired, for audit + display. */
  ruleId: string;
  /** Temperature normalised to rectal-equivalent °F, rounded to 1dp. */
  rectalEquivalentF: number;
  /** Machine-readable reasons, rendered as copy by the UI layer. */
  reasons: string[];
  /** True when the measurement method is unreliable for this age. */
  methodCaution: boolean;
}

export class FeverInputError extends Error {}

/**
 * Offsets to convert a reading to rectal-equivalent °F.
 * Rectal is the reference standard in infants; other sites read lower.
 * Conservative by design: we round toward the higher (more urgent) value.
 */
const METHOD_OFFSET_F: Record<Method, number> = {
  rectal: 0.0,
  tympanic: 0.0,
  oral: 0.5,
  temporal: 0.5,
  axillary: 1.0,
};

/** Fever threshold, rectal-equivalent. */
const FEVER_F = 100.4;
/** Threshold that warrants a call at any age. */
const HIGH_F = 102.0;
/** Threshold that warrants urgent care at any age. */
const VERY_HIGH_F = 104.0;
/**
 * Below this age, ANY fever is an emergency. Non-negotiable.
 * Standard pediatric guidance: a rectal temperature of 100.4°F or higher in an
 * infant under three months warrants immediate evaluation, every time.
 */
const NEONATE_MAX_MONTHS = 3;
/** Below this age, tympanic readings are unreliable. */
const TYMPANIC_MIN_MONTHS = 6;

function validate(input: FeverInput): void {
  const { ageMonths, tempF, method, redFlags } = input;

  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 24) {
    throw new FeverInputError('ageMonths must be between 0 and 24');
  }
  // Physiologically implausible readings are almost always typos or a broken
  // thermometer. We refuse rather than guess — a wrong guess here is unsafe.
  if (!Number.isFinite(tempF) || tempF < 90 || tempF > 110) {
    throw new FeverInputError('tempF must be between 90 and 110');
  }
  if (!(method in METHOD_OFFSET_F)) {
    throw new FeverInputError(`unknown method: ${method}`);
  }
  for (const f of redFlags) {
    if (!RED_FLAGS.includes(f)) {
      throw new FeverInputError(`unknown red flag: ${f}`);
    }
  }
}

export function assessFever(input: FeverInput): FeverResult {
  validate(input);

  const { ageMonths, tempF, method, redFlags } = input;

  const rectalEquivalentF =
    Math.round((tempF + METHOD_OFFSET_F[method]) * 10) / 10;

  const methodCaution =
    method === 'tympanic' && ageMonths < TYMPANIC_MIN_MONTHS;

  const base = { rectalEquivalentF, methodCaution };

  // ---- Rules evaluate in strict precedence order. First match wins. ----

  // R1 — Any red flag is an emergency regardless of age or temperature.
  if (redFlags.length > 0) {
    return {
      ...base,
      tier: 'EMERGENCY',
      ruleId: 'R1_RED_FLAG',
      reasons: redFlags.map((f) => `red_flag:${f}`),
    };
  }

  // R2 — Any fever under 3 months is an emergency. No exceptions.
  //      This is the single most important rule in the product.
  if (ageMonths < NEONATE_MAX_MONTHS && rectalEquivalentF >= FEVER_F) {
    return {
      ...base,
      tier: 'EMERGENCY',
      ruleId: 'R2_NEONATE_FEVER',
      reasons: ['age_under_3_months', 'fever_present'],
    };
  }

  // R3 — Very high temperature at any age.
  if (rectalEquivalentF >= VERY_HIGH_F) {
    return {
      ...base,
      tier: 'EMERGENCY',
      ruleId: 'R3_VERY_HIGH_TEMP',
      reasons: ['temp_at_or_above_104'],
    };
  }

  // R4 — Under 3 months without fever. The parent opened a triage tool about a
  //      newborn; conservative bias says a clinician should hear about it.
  if (ageMonths < NEONATE_MAX_MONTHS) {
    return {
      ...base,
      tier: 'CALL',
      ruleId: 'R4_NEONATE_NO_FEVER',
      reasons: ['age_under_3_months', 'no_fever_but_conservative'],
    };
  }

  // R5 — High temperature at any age 3mo+.
  if (rectalEquivalentF >= HIGH_F) {
    return {
      ...base,
      tier: 'CALL',
      ruleId: 'R5_HIGH_TEMP',
      reasons: ['temp_at_or_above_102'],
    };
  }

  // R6 — Fever in a young infant (3–6 months) always warrants a call.
  if (ageMonths < 6 && rectalEquivalentF >= FEVER_F) {
    return {
      ...base,
      tier: 'CALL',
      ruleId: 'R6_YOUNG_INFANT_FEVER',
      reasons: ['age_under_6_months', 'fever_present'],
    };
  }

  // R7 — Fever in an older baby, no other concerning signs.
  if (rectalEquivalentF >= FEVER_F) {
    return {
      ...base,
      tier: 'HOME',
      ruleId: 'R7_FEVER_MONITOR',
      reasons: ['fever_present', 'monitor_at_home'],
    };
  }

  // R8 — No fever, no red flags, over 3 months.
  return {
    ...base,
    tier: 'HOME',
    ruleId: 'R8_NO_FEVER',
    reasons: ['no_fever'],
  };
}
