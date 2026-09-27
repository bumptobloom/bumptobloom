import 'server-only';
import { createServerClient } from '@/lib/supabase';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import {
  calculateBabyAge,
  buildAskBabyContext,
  shouldRedirectToHealth,
  REDIRECT_ANSWER,
  parseAskModelResponse,
  buildModelCallRunRow,
} from '@btb/shared';
import { getActivePromptVersion } from './prompt-version';
import { buildSystemPrompt } from './build-system-prompt';
import { createOpenAIClient } from './openai-client';

export interface AnswerQuestionInput {
  userId: string;
  babyId: string;
  conversationId: string | null;
  question: string;
}

export interface AnswerQuestionResult {
  answer: string;
  conversationId: string;
  promptVersion: string | null;
  model: string | null;
  validationOk: boolean;
  redirectedToHealth: boolean;
}

export class BabyNotFoundError extends Error {
  constructor() {
    super('Baby not found or does not belong to the authenticated parent');
    this.name = 'BabyNotFoundError';
  }
}

export class AskUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AskUpstreamError';
  }
}

export class ConversationAccessError extends Error {
  constructor() {
    super('This conversation does not belong to the authenticated parent');
    this.name = 'ConversationAccessError';
  }
}

// Shown to the parent AND stored as the assistant's turn in ai_messages when
// OpenAI's response fails validation. One shared constant so the message a
// parent sees and the message route.ts logs can never drift apart.
//
// #71's context-window assembly reads from ai_messages and will see this as
// a normal previous assistant turn unless it's excluded. There's no flag
// column on ai_messages for this (schema change, not made here) — the
// signal already exists via ai_runs: any assistant message whose
// corresponding ai_runs row (join on message_id) has validation_ok = false
// is one of these failure placeholders, not a real answer, and #71 should
// skip it when building context.
export const ASK_VALIDATION_FAILURE_MESSAGE =
  "Couldn't reach the assistant. Please try again.";

// Postgres's SQLSTATE for a row-level security policy rejecting a write.
// Branch on this, not on error message text -- see PostgrestError.ts.
const RLS_VIOLATION_CODE = '42501';

export async function answerQuestion(
  input: AnswerQuestionInput,
): Promise<AnswerQuestionResult> {
  const supabase = await createServerClient();

  // Verify the baby belongs to this parent. RLS's "own babies" policy means
  // a row only comes back if it actually is this parent's -- no separate
  // parent_id join needed here.
  const { data: baby, error: babyError } = await supabase
    .from('babies')
    .select('id, birth_date, due_date')
    .eq('id', input.babyId)
    .maybeSingle();

  if (babyError) {
    throw new AskUpstreamError(`Failed to look up baby: ${babyError.message}`);
  }
  if (!baby) {
    throw new BabyNotFoundError();
  }

  const { data: parentProfile, error: parentError } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', input.userId)
    .single();

  if (parentError || !parentProfile) {
    throw new AskUpstreamError('Parent profile not found for the authenticated user');
  }

  let conversationId: string;

  if (input.conversationId) {
    conversationId = input.conversationId;
  } else {
    const { data: newConversation, error: createConversationError } = await supabase
      .from('ai_conversations')
      .insert({ parent_id: parentProfile.id, baby_id: input.babyId })
      .select('id')
      .single();

    if (createConversationError || !newConversation) {
      throw new AskUpstreamError(
        `Failed to create conversation: ${createConversationError?.message}`,
      );
    }
    conversationId = newConversation.id;
  }

  // Log the question regardless of what happens next -- it's part of the
  // conversation whether it gets redirected, answered, or fails.
  const { error: userMessageError } = await supabase
    .from('ai_messages')
    .insert({ conversation_id: conversationId, role: 'user', content: input.question });

  if (userMessageError) {
    // A client-supplied conversationId that fails RLS is a permission
    // problem (403), not an upstream/network one (502) -- worth
    // distinguishing so nobody debugs a network issue that isn't one.
    // A conversation we just created ourselves failing this same check
    // would be a genuine anomaly, so this is scoped to the client-supplied
    // case only.
    if (input.conversationId && userMessageError.code === RLS_VIOLATION_CODE) {
      throw new ConversationAccessError();
    }
    throw new AskUpstreamError(`Failed to log question: ${userMessageError.message}`);
  }

  // The triage guard runs before any model call. A redirect never "answers"
  // via a model, so there is nothing truthful to put in ai_runs's NOT NULL
  // prompt_version/model columns -- no run row exists for this case.
  if (shouldRedirectToHealth(input.question)) {
    const { error: refusalMessageError } = await supabase
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role: 'assistant', content: REDIRECT_ANSWER });

    if (refusalMessageError) {
      console.error('[ask] Failed to log health redirect message:', refusalMessageError.message);
    }

    return {
      answer: REDIRECT_ANSWER,
      conversationId,
      promptVersion: null,
      model: null,
      validationOk: true,
      redirectedToHealth: true,
    };
  }

  // Age is derived here, server-side, from birth_date. The client never
  // sends one and never could -- there is no age field in the request body.
  const { ageMonths } = calculateBabyAge(baby.birth_date, { dueDate: baby.due_date });
  const context = buildAskBabyContext(ageMonths);

  const activePromptVersion = await getActivePromptVersion();
  const systemPrompt = buildSystemPrompt(activePromptVersion.systemPrompt, context);

  const openai = createOpenAIClient();
  const startedAt = Date.now();
  let completion;

  try {
    completion = await openai.chat.completions.create({
      model: activePromptVersion.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.question },
      ],
    });
  } catch (err) {
    // Per docs/API-CONTRACTS.md: any error here means a plain "couldn't
    // reach the assistant" state -- never a cached or generated fallback.
    throw new AskUpstreamError(
      err instanceof Error ? err.message : 'OpenAI request failed',
    );
  }

  const latencyMs = Date.now() - startedAt;

  // Validate the response shape before any of it is trusted. A malformed
  // response (missing/empty content, missing usage, etc.) must never reach
  // a parent -- this is the check that used to be missing, per #46.
  const parsed = parseAskModelResponse(completion);

  // Best-effort tokens even on a validation failure -- usage can be fine
  // even when content itself is what failed, and ai_runs' token columns
  // are nullable for exactly this case.
  const rawInputTokens = completion.usage?.prompt_tokens ?? null;
  const rawOutputTokens = completion.usage?.completion_tokens ?? null;

  if (!parsed.ok) {
    console.error('[ask] OpenAI response failed validation:', parsed.reason);

    // The failure is still "the assistant's turn" in this conversation --
    // stored so future context-window assembly and conversation history
    // stay coherent, same pattern as the guard's REDIRECT_ANSWER above.
    try {
      const { data: failureMessage, error: failureMessageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: ASK_VALIDATION_FAILURE_MESSAGE,
        })
        .select('id')
        .single();

      if (failureMessageError || !failureMessage) {
        throw new Error(failureMessageError?.message ?? 'insert returned no row');
      }

      // This is a real call that reached OpenAI and failed validation --
      // exactly the kind of run this table exists to make visible, unlike
      // a guard-blocked question which never called a model at all.
      const serviceRole = createServiceRoleClient();
      const { error: runError } = await serviceRole.from('ai_runs').insert(
        buildModelCallRunRow({
          messageId: failureMessage.id,
          promptVersion: activePromptVersion.version,
          model: activePromptVersion.model,
          inputTokens: rawInputTokens,
          outputTokens: rawOutputTokens,
          latencyMs,
          validationOk: false,
        }),
      );

      if (runError) {
        console.error('[ask] Failed to record failed ai_runs row:', runError.message);
      }
    } catch (err) {
      console.error(
        '[ask] Failed to log the validation failure:',
        err instanceof Error ? err.message : err,
      );
    }

    throw new AskUpstreamError(`OpenAI response failed validation: ${parsed.reason}`);
  }

  const answer = parsed.answer;

  // From here on, the parent already has a real, validated answer. A
  // logging failure must never take that away -- same principle the fever
  // checker's fire-and-forget logging follows. Failures are reported, not
  // thrown.
  try {
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role: 'assistant', content: answer })
      .select('id')
      .single();

    if (assistantMessageError || !assistantMessage) {
      throw new Error(assistantMessageError?.message ?? 'insert returned no row');
    }

    // ai_runs has no INSERT policy for authenticated users -- this is
    // server-recorded metadata, not something a user's own session is
    // trusted to write. Service role only.
    const serviceRole = createServiceRoleClient();
    const { error: runError } = await serviceRole.from('ai_runs').insert(
      buildModelCallRunRow({
        messageId: assistantMessage.id,
        promptVersion: activePromptVersion.version,
        model: activePromptVersion.model,
        inputTokens: parsed.inputTokens,
        outputTokens: parsed.outputTokens,
        latencyMs,
        validationOk: true,
      }),
    );

    if (runError) {
      console.error('[ask] Failed to record ai_runs:', runError.message);
    }
  } catch (err) {
    console.error(
      '[ask] Failed to log the answer or run:',
      err instanceof Error ? err.message : err,
    );
  }

  return {
    answer,
    conversationId,
    promptVersion: activePromptVersion.version,
    model: activePromptVersion.model,
    validationOk: true,
    redirectedToHealth: false,
  };
}
