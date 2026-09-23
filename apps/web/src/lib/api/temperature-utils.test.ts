import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_TEMP_F,
  MIN_TEMP_F,
  TEMPERATURE_METHODS,
  TemperatureInputError,
  summarizeReadings,
  todayBoundsUtc,
  validateNewReading,
} from './temperature-utils.ts';

const BABY = '20000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-21T12:00:00Z');

// ---------------------------------------------------------------- summary

test('summary of no readings is a zero count and no highest', () => {
  assert.deepEqual(summarizeReadings([]), { highestTempF: null, count: 0 });
});

test('summary matches the list: highest value and total count', () => {
  const readings = [{ tempF: 99.1 }, { tempF: 100.8 }, { tempF: 98.6 }];
  assert.deepEqual(summarizeReadings(readings), { highestTempF: 100.8, count: 3 });
});

test('summary is the same whatever order the list is in', () => {
  const a = summarizeReadings([{ tempF: 101.2 }, { tempF: 99 }]);
  const b = summarizeReadings([{ tempF: 99 }, { tempF: 101.2 }]);
  assert.deepEqual(a, b);
});

test('summary carries no interpretation of the reading (ADR-007)', () => {
  const summary = summarizeReadings([{ tempF: 104 }]);
  assert.deepEqual(Object.keys(summary).sort(), ['count', 'highestTempF']);
});

// ------------------------------------------------------------- validation

test('a valid reading passes and keeps its values', () => {
  const valid = validateNewReading(
    { babyId: BABY, tempF: 99.4, method: 'axillary', notes: '  after nap  ' },
    NOW
  );
  assert.equal(valid.tempF, 99.4);
  assert.equal(valid.method, 'axillary');
  assert.equal(valid.notes, 'after nap');
  assert.equal(valid.takenAt, null);
});

test('temperature is rounded to one decimal, matching numeric(4,1)', () => {
  const valid = validateNewReading({ babyId: BABY, tempF: 99.46, method: 'rectal' }, NOW);
  assert.equal(valid.tempF, 99.5);
});

test('the range edges are accepted, anything outside is refused', () => {
  for (const tempF of [MIN_TEMP_F, MAX_TEMP_F]) {
    assert.doesNotThrow(() => validateNewReading({ babyId: BABY, tempF, method: 'rectal' }, NOW));
  }
  for (const tempF of [MIN_TEMP_F - 0.1, MAX_TEMP_F + 0.1, 45, 200, Number.NaN]) {
    assert.throws(
      () => validateNewReading({ babyId: BABY, tempF, method: 'rectal' }, NOW),
      TemperatureInputError
    );
  }
});

test('only the four methods the migration allows are accepted', () => {
  assert.deepEqual([...TEMPERATURE_METHODS].sort(), ['axillary', 'rectal', 'temporal', 'tympanic']);
  assert.throws(
    // @ts-expect-error: deliberately invalid method
    () => validateNewReading({ babyId: BABY, tempF: 99, method: 'oral' }, NOW),
    TemperatureInputError
  );
});

test('an empty or whitespace note is stored as null', () => {
  for (const notes of ['', '   ', null, undefined]) {
    const valid = validateNewReading({ babyId: BABY, tempF: 99, method: 'temporal', notes }, NOW);
    assert.equal(valid.notes, null);
  }
});

test('a reading can be back-dated but not put in the future', () => {
  const earlier = validateNewReading(
    { babyId: BABY, tempF: 99, method: 'temporal', takenAt: '2026-09-21T09:30:00Z' },
    NOW
  );
  assert.equal(earlier.takenAt, '2026-09-21T09:30:00.000Z');

  assert.throws(
    () =>
      validateNewReading(
        { babyId: BABY, tempF: 99, method: 'temporal', takenAt: '2026-09-21T13:00:00Z' },
        NOW
      ),
    TemperatureInputError
  );
  assert.throws(
    () => validateNewReading({ babyId: BABY, tempF: 99, method: 'temporal', takenAt: 'yesterday' }, NOW),
    TemperatureInputError
  );
});

test('a reading needs a baby', () => {
  assert.throws(
    () => validateNewReading({ babyId: '', tempF: 99, method: 'temporal' }, NOW),
    TemperatureInputError
  );
});

// ------------------------------------------------------------------ today

test('today in UTC is midnight to midnight UTC', () => {
  const { start, end } = todayBoundsUtc(NOW, 'UTC');
  assert.equal(start.toISOString(), '2026-09-21T00:00:00.000Z');
  assert.equal(end.toISOString(), '2026-09-22T00:00:00.000Z');
});

test('today follows the mother’s own time zone, not the server’s', () => {
  // 22:30 UTC on the 21st is already 01:30 on the 22nd in Riyadh (UTC+3).
  const lateUtc = new Date('2026-09-21T22:30:00Z');
  const { start, end } = todayBoundsUtc(lateUtc, 'Asia/Riyadh');
  assert.equal(start.toISOString(), '2026-09-21T21:00:00.000Z');
  assert.equal(end.toISOString(), '2026-09-22T21:00:00.000Z');
});

test('today works west of UTC too', () => {
  // 03:00 UTC on the 21st is still the evening of the 20th in Los Angeles.
  const { start } = todayBoundsUtc(new Date('2026-09-21T03:00:00Z'), 'America/Los_Angeles');
  assert.equal(start.toISOString(), '2026-09-20T07:00:00.000Z');
});

test('a daylight-saving day is 23 hours long, not 24', () => {
  // US clocks spring forward on 8 March 2026.
  const { start, end } = todayBoundsUtc(new Date('2026-03-08T18:00:00Z'), 'America/New_York');
  assert.equal(start.toISOString(), '2026-03-08T05:00:00.000Z');
  assert.equal(end.toISOString(), '2026-03-09T04:00:00.000Z');
});

test('a missing or unknown time zone falls back to UTC instead of failing', () => {
  for (const zone of [null, undefined, '', 'Mars/Olympus_Mons']) {
    const { start } = todayBoundsUtc(NOW, zone);
    assert.equal(start.toISOString(), '2026-09-21T00:00:00.000Z');
  }
});
