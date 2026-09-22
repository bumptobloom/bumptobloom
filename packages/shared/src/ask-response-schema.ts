/**
 * Validates the raw OpenAI chat completion response before any part of it
 * is used or shown to a parent.
 *
 * Only validates the fields Ask actually consumes (answer text + token
 * usage) — deliberately NOT `.strict()`, so unrelated fields OpenAI adds to
 * their response over time don't break this. A response that fails this
 * check must never reach a parent; the caller should log validation_ok=false
 * and show the generic "couldn't reach the assistant" state per
 * docs/API-CONTRACTS.md's Ask failure behaviour.
 */

import { z } from 'zod';

const OpenAIChoiceSchema = z.object({
  message: z.object({
    // A blank answer is as unusable to a parent as a malformed one.
    content: z.string().trim().min(1),
  }),
});

const OpenAIUsageSchema = z.object({
  prompt_tokens: z.number().int().nonnegative(),
  completion_tokens: z.number().int().nonnegative(),
});

const OpenAIChatCompletionSchema = z.object({
  choices: z.array(OpenAIChoiceSchema).min(1),
  usage: OpenAIUsageSchema,
});

export type ParsedAskModelResponse =
  | {
      ok: true;
      answer: string;
      inputTokens: number;
      outputTokens: number;
    }
  | {
      ok: false;
      reason: string;
    };

/**
 * Parses and validates a raw OpenAI response. Never throws — callers should
 * always get a result they can log and branch on.
 */
export function parseAskModelResponse(raw: unknown): ParsedAskModelResponse {
  const result = OpenAIChatCompletionSchema.safeParse(raw);

  if (!result.success) {
    return {
      ok: false,
      reason: result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; '),
    };
  }

  const { choices, usage } = result.data;

  return {
    ok: true,
    answer: choices[0].message.content,
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
  };
}
