export interface PromptVersionRow {
  id: string;
  version: string;
  systemPrompt: string;
  model: string;
  active: boolean;
}

/**
 * Picks the single active row out of a set of prompt_versions rows.
 *
 * The database enforces "at most one active row" (a partial unique index
 * in 0003_prompt_version_active_constraint.sql), but not "never zero" --
 * deactivating the only active row without activating a replacement is a
 * reachable misconfiguration, not a hypothetical, so it is checked here too.
 */
export function pickActivePromptVersion(
  rows: readonly PromptVersionRow[],
): PromptVersionRow {
  const active = rows.filter((row) => row.active);

  if (active.length === 0) {
    throw new Error('No active prompt_versions row found.');
  }

  if (active.length > 1) {
    throw new Error(
      `Expected exactly one active prompt_versions row, found ${active.length}.`,
    );
  }

  return active[0];
}
