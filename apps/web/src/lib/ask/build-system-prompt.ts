import type { AskBabyContext } from '@btb/shared';

/**
 * Composes the final system prompt from the active prompt_versions row's
 * text plus the privacy-safe baby context.
 *
 * Deliberately separate from packages/shared/src/ask-prompt.ts's
 * buildAskSystemPrompt, which reads a hardcoded constant that is now
 * superseded by the prompt_versions table -- this takes the prompt text
 * as a parameter instead, so it works regardless of source and doesn't
 * extend code that's slated for removal.
 */
export function buildSystemPrompt(
  systemPromptText: string,
  context: AskBabyContext,
): string {
  return [
    systemPromptText,
    '',
    'Baby context:',
    `- Age in months: ${context.ageMonths}`,
    `- Developmental stage: ${context.developmentalStage}`,
  ].join('\n');
}
