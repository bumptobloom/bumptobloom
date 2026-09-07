export { shouldRedirectToHealth, REDIRECT_ANSWER } from './triage-guard';
export {
  calculateBabyAge,
  deriveAgeMonths,
  formatAgeLabel,
  SECONDS_PER_MONTH,
  MS_PER_MONTH,
  MS_PER_DAY,
  type AgeOptions,
  type BabyAgeResult,
} from './age';

export {
  buildAskBabyContext,
  getDevelopmentalStage,
  type AskBabyContext,
  type DevelopmentalStage,
} from './ask-context.ts';

export {
  ASK_SYSTEM_PROMPT,
  ASK_SYSTEM_PROMPT_VERSION,
  buildAskSystemPrompt,
} from './ask-prompt.ts';
