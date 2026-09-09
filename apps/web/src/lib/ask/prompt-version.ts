import { createServerClient } from '@/lib/supabase';
import { pickActivePromptVersion, type PromptVersionRow } from './pick-active-prompt-version';

/**
 * Reads the currently active prompt version from the database. Switching
 * which row is active changes what this returns without a deploy.
 */
export async function getActivePromptVersion(): Promise<PromptVersionRow> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('prompt_versions')
    .select('id, version, system_prompt, model, active');

  if (error) {
    throw new Error(`Failed to read prompt_versions: ${error.message}`);
  }

  const rows: PromptVersionRow[] = (data ?? []).map((row) => ({
    id: row.id,
    version: row.version,
    systemPrompt: row.system_prompt,
    model: row.model,
    active: row.active,
  }));

  return pickActivePromptVersion(rows);
}
