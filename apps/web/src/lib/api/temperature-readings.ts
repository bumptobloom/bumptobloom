import { createServerClient } from '@/lib/supabase';
import type {
  NewTemperatureReading,
  TemperatureMethod,
  TemperatureReading,
  TodaysTemperatures,
} from './types';
import { summarizeReadings, todayBoundsUtc, validateNewReading } from './temperature-utils';

/**
 * Vitals temperature log data layer (#181).
 *
 * Every query uses the signed-in user's client, never the service-role one, so
 * the "own temperature readings" RLS policy is what decides access. Another
 * mother's baby id simply returns nothing on read and fails on write.
 */

type TemperatureRow = {
  id: string;
  baby_id: string;
  temp_f: number | string; // numeric can arrive as a string
  method: TemperatureMethod;
  notes: string | null;
  created_at: string;
};

const COLUMNS = 'id, baby_id, temp_f, method, notes, created_at';

function toReading(row: TemperatureRow): TemperatureReading {
  return {
    id: row.id,
    babyId: row.baby_id,
    tempF: Number(row.temp_f),
    method: row.method,
    notes: row.notes,
    takenAt: row.created_at,
  };
}

/**
 * Save one reading. Validates first, so an implausible value never reaches
 * the database. Throws TemperatureInputError for bad input and a plain Error
 * if the database refuses (including an RLS refusal for someone else's baby).
 */
export async function saveTemperatureReading(
  input: NewTemperatureReading
): Promise<TemperatureReading> {
  const valid = validateNewReading(input);
  const supabase = await createServerClient();

  const row: Record<string, unknown> = {
    baby_id: valid.babyId,
    temp_f: valid.tempF,
    method: valid.method,
    notes: valid.notes,
  };
  if (valid.takenAt) {
    row.created_at = valid.takenAt;
  }

  const { data, error } = await supabase
    .from('temperature_readings')
    .insert(row)
    .select(COLUMNS)
    .single();

  if (error) {
    console.error('[saveTemperatureReading] Database error:', error.message);
    throw new Error(`Could not save the reading: ${error.message}`);
  }

  return toReading(data as TemperatureRow);
}

/**
 * Today's readings, newest first, plus Today's Summary derived from them.
 * "Today" is the parent's own day, from parent_profiles.timezone, falling back
 * to UTC when it is not set.
 */
export async function getTodaysTemperatures(
  babyId: string,
  now: Date = new Date()
): Promise<TodaysTemperatures> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { readings: [], summary: summarizeReadings([]) };
  }

  const { data: profile } = await supabase
    .from('parent_profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .maybeSingle();

  const { start, end } = todayBoundsUtc(now, profile?.timezone);

  const { data, error } = await supabase
    .from('temperature_readings')
    .select(COLUMNS)
    .eq('baby_id', babyId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getTodaysTemperatures] Database error:', error.message);
    throw new Error(`Could not load today's readings: ${error.message}`);
  }

  const readings = (data ?? []).map((row) => toReading(row as TemperatureRow));
  return { readings, summary: summarizeReadings(readings) };
}
