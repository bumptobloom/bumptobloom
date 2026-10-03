import {
  MAX_DUE_DATE_AFTER_BIRTH_DAYS,
  MAX_DUE_DATE_BEFORE_BIRTH_DAYS,
} from '@btb/shared';

export interface BabyValidationInput {
  name: string;
  birthDate: string;
  dueDate?: string | null;
}

/**
 * Completed months between two UTC calendar dates.
 *
 * Whole months from the calendar parts, not by adding months to a Date.
 * `setMonth(getMonth() - 25)` on the 31st rolls into the next month (31 March
 * minus one month is 3 March, not 28 February), which moved this boundary by a
 * day depending on which day of the month a parent signed up.
 */
function completedMonthsUtc(from: Date, to: Date): number {
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());
  return to.getUTCDate() < from.getUTCDate() ? months - 1 : months;
}

/** Midnight UTC on the day `at` falls on. */
function startOfUtcDay(at: Date): Date {
  return new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
}

export function validateBabyInput(input: BabyValidationInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Baby name is required');
  }

  if (!input.birthDate) {
    throw new Error('Birth date is required');
  }

  // UTC, per Keya's call on 1 Oct: one window for every parent, and the same
  // answer here as on Vercel.
  //
  // This matters more than it looks. validateBabyInput runs in two places -
  // baby-profile-form.tsx in the parent's browser, and lib/api/baby.ts on the
  // server. With local-time arithmetic the two disagreed: a parent in Pacific
  // entering a date in the evening could pass the check in her browser and
  // fail it on the server, because the server's "today" was already tomorrow.
  const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);

  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth date');
  }

  const today = startOfUtcDay(new Date());

  if (birthDate > today) {
    throw new Error('Birth date cannot be in the future');
  }

  const dueDate = input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    throw new Error('Please check the due date, it looks invalid');
  }
  if (dueDate) {
    const dueDateDiffDays = Math.round((dueDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    if (
      dueDateDiffDays > MAX_DUE_DATE_AFTER_BIRTH_DAYS ||
      dueDateDiffDays < -MAX_DUE_DATE_BEFORE_BIRTH_DAYS
    ) {
      throw new Error('Please check the due date, it looks too far from the birth date');
    }
  }

  // 24 completed months is the last month the app has content for, so a baby
  // of exactly 25 months is out and 24 months plus any number of days is in -
  // the same boundary the old date arithmetic intended.
  if (completedMonthsUtc(birthDate, today) > 24) {
    throw new Error('Birth date is outside the 0–24 month range');
  }

  return {
    name,
    birthDate: input.birthDate,
    dueDate: input.dueDate || null,
  };
}
