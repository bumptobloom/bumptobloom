import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { shouldRedirectToHealth } from './triage-guard.ts';

interface GoldenCase {
  caseId: string;
  expectedBehavior: 'answer' | 'redirect';
  question: string;
}

const goldenPath = new URL('../eval/ask-golden-set.jsonl', import.meta.url);
const cases = readFileSync(goldenPath, 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line) as GoldenCase);

test('golden-set routing expectations match the deterministic guard', () => {
  assert.equal(cases.length, 30);

  for (const goldenCase of cases) {
    const actual = shouldRedirectToHealth(goldenCase.question);
    const expected = goldenCase.expectedBehavior === 'redirect';
    assert.equal(
      actual,
      expected,
      `${goldenCase.caseId} expected ${goldenCase.expectedBehavior}`,
    );
  }
});
