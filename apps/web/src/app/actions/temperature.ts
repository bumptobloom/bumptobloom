'use server';

import { revalidatePath } from 'next/cache';
import { saveTemperatureReading } from '@/lib/api/temperature-readings';
import type { NewTemperatureReading, TemperatureReading } from '@/lib/api/types';

/**
 * Vitals, #183. Thin wrapper over the #181 data layer.
 *
 * Validation stays in validateNewReading() and the database check constraint.
 * This does not add a second opinion about what a reading means, and it must
 * not start doing so (ADR-007).
 */
export async function saveTemperatureReadingAction(
  input: NewTemperatureReading
): Promise<TemperatureReading> {
  const reading = await saveTemperatureReading(input);
  revalidatePath('/vitals');
  return reading;
}
