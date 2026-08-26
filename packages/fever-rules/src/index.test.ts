/**
 * BumpToBloom — Fever Rules Safety Test Table
 * -------------------------------------------
 * This file is the safety contract. A failure here blocks merge — see
 * .github/workflows/ci.yml. Do not weaken a case to make a build pass;
 * if a case is wrong, it needs the clinical reviewer, not a developer.
 *
 * Run: node --experimental-strip-types --test src/index.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assessFever,
  FeverInputError,
  type FeverInput,
  type Tier,
  type Method,
  type RedFlag,
} from './index.ts';

type Case = {
  name: string;
  ageMonths: number;
  tempF: number;
  method?: Method;
  redFlags?: RedFlag[];
  expect: Tier;
  expectRule?: string;
};

const CASES: Case[] = [
  // ---------------------------------------------------------------
  // The under-3-months rule. Standard pediatric guidance: any fever in an
  // infant under three months is always an emergency, no exceptions.
  // ---------------------------------------------------------------
  { name: 'newborn 0mo at exactly 100.4', ageMonths: 0, tempF: 100.4, expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  { name: 'newborn 0mo just below threshold', ageMonths: 0, tempF: 100.3, expect: 'CALL', expectRule: 'R4_NEONATE_NO_FEVER' },
  { name: '1mo with fever', ageMonths: 1, tempF: 101.0, expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  // The exact case shown in the Figma prototype (screen 11), where the flow
  // currently lands on home-care advice.
  { name: 'THE FIGMA CASE: 2mo at 101.4', ageMonths: 2, tempF: 101.4, expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  { name: '2.9mo with fever still emergency', ageMonths: 2.9, tempF: 100.5, expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  { name: '3mo exactly is NOT the neonate rule', ageMonths: 3, tempF: 100.5, expect: 'CALL', expectRule: 'R6_YOUNG_INFANT_FEVER' },

  // ---------------------------------------------------------------
  // Red flags override everything, at every age and temperature.
  // ---------------------------------------------------------------
  { name: 'red flag with no fever at all', ageMonths: 18, tempF: 98.6, redFlags: ['seizure'], expect: 'EMERGENCY', expectRule: 'R1_RED_FLAG' },
  { name: 'red flag below normal temp', ageMonths: 12, tempF: 96.0, redFlags: ['blue_or_gray'], expect: 'EMERGENCY', expectRule: 'R1_RED_FLAG' },
  { name: 'red flag in oldest supported baby', ageMonths: 24, tempF: 99.0, redFlags: ['stiff_neck'], expect: 'EMERGENCY', expectRule: 'R1_RED_FLAG' },
  { name: 'multiple red flags', ageMonths: 9, tempF: 100.0, redFlags: ['trouble_breathing', 'hard_to_wake'], expect: 'EMERGENCY', expectRule: 'R1_RED_FLAG' },
  { name: 'red flag beats neonate rule (same tier, R1 first)', ageMonths: 1, tempF: 101.0, redFlags: ['seizure'], expect: 'EMERGENCY', expectRule: 'R1_RED_FLAG' },

  // ---------------------------------------------------------------
  // Very high temperature at any age.
  // ---------------------------------------------------------------
  { name: '104.0 at 24mo is emergency', ageMonths: 24, tempF: 104.0, expect: 'EMERGENCY', expectRule: 'R3_VERY_HIGH_TEMP' },
  { name: '103.9 at 24mo is only a call', ageMonths: 24, tempF: 103.9, expect: 'CALL', expectRule: 'R5_HIGH_TEMP' },
  { name: '105 at 12mo', ageMonths: 12, tempF: 105.0, expect: 'EMERGENCY', expectRule: 'R3_VERY_HIGH_TEMP' },

  // ---------------------------------------------------------------
  // 3–6 months: fever always warrants a call.
  // ---------------------------------------------------------------
  { name: '4mo with mild fever', ageMonths: 4, tempF: 100.6, expect: 'CALL', expectRule: 'R6_YOUNG_INFANT_FEVER' },
  { name: '5mo no fever', ageMonths: 5, tempF: 99.5, expect: 'HOME', expectRule: 'R8_NO_FEVER' },
  { name: '5.9mo with fever', ageMonths: 5.9, tempF: 100.4, expect: 'CALL', expectRule: 'R6_YOUNG_INFANT_FEVER' },
  { name: '6mo with mild fever falls through to monitor', ageMonths: 6, tempF: 100.4, expect: 'HOME', expectRule: 'R7_FEVER_MONITOR' },

  // ---------------------------------------------------------------
  // Older babies.
  // ---------------------------------------------------------------
  { name: '12mo at 102.0 is a call', ageMonths: 12, tempF: 102.0, expect: 'CALL', expectRule: 'R5_HIGH_TEMP' },
  { name: '12mo at 101.9 is monitor', ageMonths: 12, tempF: 101.9, expect: 'HOME', expectRule: 'R7_FEVER_MONITOR' },
  { name: '18mo perfectly normal', ageMonths: 18, tempF: 98.6, expect: 'HOME', expectRule: 'R8_NO_FEVER' },

  // ---------------------------------------------------------------
  // Measurement method conversion. An axillary reading is ~1°F low,
  // so a "safe-looking" armpit temp can be a real fever.
  // ---------------------------------------------------------------
  { name: 'axillary 99.5 in 2mo becomes 100.5 rectal-equiv = EMERGENCY', ageMonths: 2, tempF: 99.5, method: 'axillary', expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  { name: 'same axillary reading at 12mo is only monitor', ageMonths: 12, tempF: 99.5, method: 'axillary', expect: 'HOME', expectRule: 'R7_FEVER_MONITOR' },
  { name: 'oral 99.9 in 1mo becomes 100.4 = EMERGENCY', ageMonths: 1, tempF: 99.9, method: 'oral', expect: 'EMERGENCY', expectRule: 'R2_NEONATE_FEVER' },
  { name: 'rectal is the reference, no offset', ageMonths: 2, tempF: 100.3, method: 'rectal', expect: 'CALL', expectRule: 'R4_NEONATE_NO_FEVER' },
  { name: 'temporal 103.6 becomes 104.1 = EMERGENCY', ageMonths: 20, tempF: 103.6, method: 'temporal', expect: 'EMERGENCY', expectRule: 'R3_VERY_HIGH_TEMP' },
];

for (const c of CASES) {
  test(c.name, () => {
    const input: FeverInput = {
      ageMonths: c.ageMonths,
      tempF: c.tempF,
      method: c.method ?? 'rectal',
      redFlags: c.redFlags ?? [],
    };
    const result = assessFever(input);
    assert.equal(result.tier, c.expect, `expected ${c.expect}, got ${result.tier} via ${result.ruleId}`);
    if (c.expectRule) {
      assert.equal(result.ruleId, c.expectRule);
    }
  });
}

// ---------------------------------------------------------------
// Invariant: NO combination of inputs may return HOME for a baby
// under 3 months with a fever. Brute-forced rather than sampled.
// ---------------------------------------------------------------
test('INVARIANT: no under-3-months fever ever returns HOME', () => {
  const methods: Method[] = ['rectal', 'oral', 'axillary', 'temporal', 'tympanic'];
  let checked = 0;
  for (let age = 0; age < 3; age += 0.5) {
    for (let t = 96.0; t <= 106.0; t += 0.1) {
      for (const method of methods) {
        const r = assessFever({ ageMonths: age, tempF: Math.round(t * 10) / 10, method, redFlags: [] });
        if (r.rectalEquivalentF >= 100.4) {
          assert.equal(r.tier, 'EMERGENCY', `age ${age} temp ${t} ${method} returned ${r.tier}`);
        }
        assert.notEqual(r.tier, 'HOME', `age ${age} temp ${t} ${method} returned HOME for a newborn`);
        checked++;
      }
    }
  }
  assert.ok(checked > 1000, `expected a broad sweep, only checked ${checked}`);
});

// ---------------------------------------------------------------
// Invariant: a red flag can never produce anything but EMERGENCY.
// ---------------------------------------------------------------
test('INVARIANT: any red flag always returns EMERGENCY', () => {
  const flags: RedFlag[] = ['trouble_breathing', 'blue_or_gray', 'hard_to_wake', 'stiff_neck', 'non_blanching_rash', 'under_3_wet_diapers', 'inconsolable_2h', 'seizure'];
  for (let age = 0; age <= 24; age += 1) {
    for (let t = 95.0; t <= 106.0; t += 0.5) {
      for (const flag of flags) {
        const r = assessFever({ ageMonths: age, tempF: t, method: 'rectal', redFlags: [flag] });
        assert.equal(r.tier, 'EMERGENCY', `age ${age} temp ${t} flag ${flag} returned ${r.tier}`);
      }
    }
  }
});

// ---------------------------------------------------------------
// Determinism: the same input must always give the same answer.
// ---------------------------------------------------------------
test('INVARIANT: assessment is deterministic', () => {
  const input: FeverInput = { ageMonths: 7, tempF: 102.3, method: 'oral', redFlags: [] };
  const first = JSON.stringify(assessFever(input));
  for (let i = 0; i < 100; i++) {
    assert.equal(JSON.stringify(assessFever(input)), first);
  }
});

// ---------------------------------------------------------------
// Input validation.
// ---------------------------------------------------------------
test('rejects out-of-range age', () => {
  assert.throws(() => assessFever({ ageMonths: 25, tempF: 100, method: 'rectal', redFlags: [] }), FeverInputError);
  assert.throws(() => assessFever({ ageMonths: -1, tempF: 100, method: 'rectal', redFlags: [] }), FeverInputError);
});

test('rejects implausible temperature', () => {
  assert.throws(() => assessFever({ ageMonths: 5, tempF: 45, method: 'rectal', redFlags: [] }), FeverInputError);
  assert.throws(() => assessFever({ ageMonths: 5, tempF: 200, method: 'rectal', redFlags: [] }), FeverInputError);
});

test('rejects unknown red flag', () => {
  assert.throws(
    () => assessFever({ ageMonths: 5, tempF: 100, method: 'rectal', redFlags: ['made_up' as RedFlag] }),
    FeverInputError,
  );
});

test('flags tympanic as unreliable under 6 months', () => {
  const r = assessFever({ ageMonths: 3, tempF: 100.0, method: 'tympanic', redFlags: [] });
  assert.equal(r.methodCaution, true);
  const older = assessFever({ ageMonths: 9, tempF: 100.0, method: 'tympanic', redFlags: [] });
  assert.equal(older.methodCaution, false);
});
