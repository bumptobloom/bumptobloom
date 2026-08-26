/**
 * Safety net tests for the Ask triage guard. Ported from the Python service
 * when we consolidated on TypeScript (ADR-001).
 *
 * Run: node --experimental-strip-types --test src/triage-guard.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldRedirectToHealth } from './triage-guard.ts';

const MUST_REDIRECT = [
  'My baby has a fever, what do I do?',
  'Is this rash normal?',
  'How much Tylenol can I give?',
  "She's been vomiting since last night",
  'He has trouble breathing',
  'What dose of ibuprofen for a 1 year old',
  'She fell off the couch, should I worry?',
  'He has a stiff neck and is very lethargic',
];

const MUST_ANSWER = [
  'What activities should I do with my 7-month-old?',
  'When do babies start crawling?',
  'Any tips for getting her to nap longer?',
  'What toys are good at this age?',
  'How many words should she know by now?',
  'When can I introduce solid food textures?',
];

for (const q of MUST_REDIRECT) {
  test(`redirects: "${q}"`, () => {
    assert.equal(shouldRedirectToHealth(q), true);
  });
}

for (const q of MUST_ANSWER) {
  test(`answers: "${q}"`, () => {
    assert.equal(shouldRedirectToHealth(q), false);
  });
}

test('is case insensitive', () => {
  assert.equal(shouldRedirectToHealth('MY BABY HAS A FEVER'), true);
  assert.equal(shouldRedirectToHealth('Fever?'), true);
});
