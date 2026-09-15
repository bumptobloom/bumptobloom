import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemPrompt } from './build-system-prompt.ts';

test('appends the baby context after the system prompt text', () => {
  const result = buildSystemPrompt('Base prompt text.', {
    ageMonths: 12,
    developmentalStage: 'late infancy',
  });

  assert.ok(result.startsWith('Base prompt text.'));
  assert.match(result, /Age in months: 12/);
  assert.match(result, /Developmental stage: late infancy/);
});

test('never includes anything beyond ageMonths and developmentalStage', () => {
  const context = { ageMonths: 6, developmentalStage: 'infancy' as const };
  const result = buildSystemPrompt('X', context);

  // Only the two permitted fields exist on the context type at all, so this
  // is really a check that the composition doesn't stringify some other
  // object by mistake.
  assert.equal(Object.keys(context).length, 2);
  assert.match(result, /Age in months: 6/);
  assert.match(result, /Developmental stage: infancy/);
});
