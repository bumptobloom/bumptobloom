'use server';

import { saveTemperatureReading } from '@/lib/api/temperature-readings';
import type { NewTemperatureReading } from '@/lib/api/types';

export async function saveTemperatureReadingAction(
  input: NewTemperatureReading
) {
  return saveTemperatureReading(input);
}