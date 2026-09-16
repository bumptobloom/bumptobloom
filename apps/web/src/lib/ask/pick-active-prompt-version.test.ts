import test from 'node:test';
import assert from 'node:assert/strict';
import { pickActivePromptVersion, type PromptVersionRow } from './pick-active-prompt-version.ts';

function row(overrides: Partial<PromptVersionRow>): PromptVersionRow {
  return {
    id: 'id',
    version: '2026.09.2',
    systemPrompt: 'system prompt',
    model: 'gpt-4o-mini',
    active: false,
    ...overrides,
  };
}

test('returns the single active row', () => {
  const rows = [
    row({ id: 'a', active: false }),
    row({ id: 'b', active: true }),
    row({ id: 'c', active: false }),
  ];

  assert.equal(pickActivePromptVersion(rows).id, 'b');
});

test('throws when no row is active', () => {
  const rows = [row({ id: 'a', active: false }), row({ id: 'b', active: false })];

  assert.throws(() => pickActivePromptVersion(rows), /No active prompt_versions row/);
});

test('throws when more than one row is active', () => {
  const rows = [row({ id: 'a', active: true }), row({ id: 'b', active: true })];

  assert.throws(
    () => pickActivePromptVersion(rows),
    /Expected exactly one active prompt_versions row, found 2/,
  );
});

test('throws on an empty list', () => {
  assert.throws(() => pickActivePromptVersion([]), /No active prompt_versions row/);
});
