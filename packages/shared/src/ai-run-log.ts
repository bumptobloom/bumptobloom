/**
 * Builds a row matching ai_runs' schema (supabase/migrations/0001_init.sql)
 * for logging one Ask call that actually reached OpenAI.
 *
 * Guard-blocked questions get NO ai_runs row at all — confirmed against
 * apps/web/src/lib/ask/answer-question.ts: a redirect never calls a model,
 * so there's nothing truthful to put in the NOT NULL prompt_version/model
 * columns. Only call this for a call that was actually attempted.
 *
 * `messageId` is a required input, not sourced here — it comes from the
 * ai_messages row answer-question.ts already saves (the real answer on
 * success, or a fallback failure message when validation fails).
 */

import { z } from 'zod';

const AiRunRowSchema = z.object({
  message_id: z.string().uuid(),
  prompt_version: z.string().min(1),
  model: z.string().min(1),
  input_tokens: z.number().int().nonnegative().nullable(),
  output_tokens: z.number().int().nonnegative().nullable(),
  latency_ms: z.number().int().nonnegative().nullable(),
  validation_ok: z.boolean(),
  redirected_to_health: z.boolean(),
});

export type AiRunRow = z.infer<typeof AiRunRowSchema>;

interface ModelCallRunInput {
  messageId: string;
  promptVersion: string;
  model: string;
  // Nullable: a validation failure can specifically mean `usage` itself
  // was missing from OpenAI's response, so tokens may not be known.
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  validationOk: boolean;
}

/** For any call that actually reached OpenAI — whether validation then
 * passed or failed. Guard-blocked questions never call this. */
export function buildModelCallRunRow(input: ModelCallRunInput): AiRunRow {
  return AiRunRowSchema.parse({
    message_id: input.messageId,
    prompt_version: input.promptVersion,
    model: input.model,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    latency_ms: input.latencyMs,
    validation_ok: input.validationOk,
    redirected_to_health: false,
  });
}
