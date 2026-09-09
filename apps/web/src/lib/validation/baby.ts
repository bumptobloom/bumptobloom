import {
  MAX_DUE_DATE_AFTER_BIRTH_DAYS,
  MAX_DUE_DATE_BEFORE_BIRTH_DAYS,
} from '@btb/shared';

export interface BabyValidationInput {
  name: string;
  birthDate: string;
  dueDate?: string | null;
}

export function validateBabyInput(input: BabyValidationInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Baby name is required');
  }

  if (!input.birthDate) {
    throw new Error('Birth date is required');
  }

  const birthDate = new Date(`${input.birthDate}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth date');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    throw new Error('Birth date cannot be in the future');
  }

  const dueDate = input.dueDate ? new Date(`${input.dueDate}T00:00:00`) : null;
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

  const oldestAllowed = new Date();
  oldestAllowed.setMonth(oldestAllowed.getMonth() - 25);
  oldestAllowed.setHours(0, 0, 0, 0);

  if (birthDate <= oldestAllowed) {
    throw new Error('Birth date is outside the 0–24 month range');
  }

  return {
    name,
    birthDate: input.birthDate,
    dueDate: input.dueDate || null,
  };
}
