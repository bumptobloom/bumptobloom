import type {
  NewTemperatureReading,
  TemperatureMethod,
  TemperatureReading,
  TemperatureSummary,
} from './types';

/**
 * Pure helpers for the Vitals temperature log (#181). No Supabase, no I/O, so
 * they run under `node --test` without a database.
 *
 * ADR-007: nothing in this file interprets a reading. It validates input,
 * works out what "today" means, and counts. It never labels a temperature.
 */

/** Must match the CHECK constraint in supabase/migrations/0004. */
export const TEMPERATURE_METHODS: readonly TemperatureMethod[] = [
  'tympanic',
  'axillary',
  'temporal',
  'rectal',
];

/**
 * Same bounds packages/fever-rules uses. Outside this range a reading is a
 * typo or a broken thermometer, and SAFETY.md says refuse rather than guess.
 */
export const MIN_TEMP_F = 90;
export const MAX_TEMP_F = 110;

/** Allowance for a phone clock that runs slightly ahead of the server. */
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export class TemperatureInputError extends Error {}

export interface ValidTemperatureInput {
  babyId: string;
  tempF: number;
  method: TemperatureMethod;
  notes: string | null;
  takenAt: string | null; // null means "let the database use now()"
}

/**
 * Check a new reading before it goes anywhere near the database.
 * Throws TemperatureInputError with a message the screen can show.
 */
export function validateNewReading(
  input: NewTemperatureReading,
  now: Date = new Date()
): ValidTemperatureInput {
  if (!input.babyId) {
    throw new TemperatureInputError('A reading needs a baby.');
  }

  const tempF = Number(input.tempF);
  if (!Number.isFinite(tempF) || tempF < MIN_TEMP_F || tempF > MAX_TEMP_F) {
    throw new TemperatureInputError(
      `Enter a temperature between ${MIN_TEMP_F} and ${MAX_TEMP_F} °F.`
    );
  }

  if (!TEMPERATURE_METHODS.includes(input.method)) {
    throw new TemperatureInputError('Choose how the temperature was taken.');
  }

  const trimmed = input.notes?.trim() ?? '';

  let takenAt: string | null = null;
  if (input.takenAt) {
    const taken = new Date(input.takenAt);
    if (Number.isNaN(taken.getTime())) {
      throw new TemperatureInputError('That time is not valid.');
    }
    if (taken.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
      throw new TemperatureInputError('A reading cannot be in the future.');
    }
    takenAt = taken.toISOString();
  }

  return {
    babyId: input.babyId,
    // The column is numeric(4,1). Round here so what we return matches what
    // the database stores.
    tempF: Math.round(tempF * 10) / 10,
    method: input.method,
    notes: trimmed === '' ? null : trimmed,
    takenAt,
  };
}

/** Is this a time zone name the runtime understands, e.g. "Asia/Riyadh"? */
export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Milliseconds the given zone is ahead of UTC at a given instant. */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant));

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallClockAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  // Drop milliseconds from the instant, since the formatted parts have none.
  return wallClockAsUtc - Math.floor(instant / 1000) * 1000;
}

/** The UTC instant of local midnight on a calendar date in a zone. */
function zonedMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const guess = Date.UTC(year, month - 1, day);
  // Two passes so a daylight-saving change on that day lands correctly.
  const first = guess - zoneOffsetMs(guess, timeZone);
  return new Date(guess - zoneOffsetMs(first, timeZone));
}

/**
 * "Today" for a mother is her own calendar day, not the server's. Vercel runs
 * in UTC, so without this a 1am reading in Riyadh would land on yesterday.
 *
 * Returns the half-open range [start, end) in UTC. An unknown or missing time
 * zone falls back to UTC rather than failing the screen.
 */
export function todayBoundsUtc(
  now: Date,
  timeZone: string | null | undefined
): { start: Date; end: Date } {
  const zone = isValidTimeZone(timeZone) ? timeZone : 'UTC';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = get('year');
  const month = get('month');
  const day = get('day');

  // Date.UTC rolls day 32 over into the next month, so day + 1 is safe.
  const next = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    start: zonedMidnight(year, month, day, zone),
    end: zonedMidnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), zone),
  };
}

/**
 * Today's Summary: the highest reading and how many there were.
 * Derived from the list every time it is shown. Never stored, so it can never
 * drift from the readings it describes.
 */
export function summarizeReadings(
  readings: Pick<TemperatureReading, 'tempF'>[]
): TemperatureSummary {
  if (readings.length === 0) {
    return { highestTempF: null, count: 0 };
  }
  return {
    highestTempF: Math.max(...readings.map((r) => r.tempF)),
    count: readings.length,
  };
}
