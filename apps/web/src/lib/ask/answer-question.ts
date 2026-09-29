import 'server-only';
import { createServerClient } from '@/lib/supabase';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import {
  calculateBabyAge,
  buildAskBabyContext,
  shouldRedirectToHealth,
  REDIRECT_ANSWER,
} from '@btb/shared';
import { getActivePromptVersion } from './prompt-version';
import { buildSystemPrompt } from './build-system-prompt';
import { createOpenAIClient } from './openai-client';
import { assertUnderRateLimit } from './rate-limit';
import { logAskAuditEvent } from './log-audit-event';
import { classifyOpenAIError } from './classify-openai-error';
import {
  BabyNotFoundError,
  ConversationAccessError,
  AskUpstreamError,
  RateLimitedError,
} from './errors';

export {
  BabyNotFoundError,
  ConversationAccessError,
  AskUpstreamError,
  RateLimitedError,
} from './errors';

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

  // A redirect never reaches OpenAI and costs nothing, so it must stay
  // reachable at the limit -- a symptom question should get the pediatrician
  // and 911 pointer, not "try again later".
  const redirectToHealth = shouldRedirectToHealth(input.question);

  if (!redirectToHealth) {
    try {
      await assertUnderRateLimit(parentProfile.id);
    } catch (err) {
      if (err instanceof RateLimitedError) {
        await logAskAuditEvent('ask_rate_limited', input.userId, null, {});
      }
      throw err;
    }
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
  if (redirectToHealth) {
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
    // Never pass err.message on: OpenAI can echo the parent's own question
    // back in it, and this reaches both audit_events and the server logs.
    const { eventType, payload, summary } = classifyOpenAIError(err);
    await logAskAuditEvent(eventType, input.userId, conversationId, payload);
    throw new AskUpstreamError(`OpenAI request failed: ${summary}`);
  }

  const latencyMs = Date.now() - startedAt;
  const answer = completion.choices[0]?.message?.content ?? '';

  // From here on, the parent already has a real answer. A logging failure
  // must never take that away -- same principle the fever checker's
  // fire-and-forget logging follows. Failures are reported, not thrown.
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
    const { error: runError } = await serviceRole.from('ai_runs').insert({
      message_id: assistantMessage.id,
      prompt_version: activePromptVersion.version,
      model: activePromptVersion.model,
      input_tokens: completion.usage?.prompt_tokens ?? null,
      output_tokens: completion.usage?.completion_tokens ?? null,
      latency_ms: latencyMs,
      // Real validation is a separate ticket's scope. false, not a
      // placeholder true -- a run this table has never actually checked
      // must not read back later as "passed validation". The API
      // response's validationOk can stay true; this is the stored row.
      validation_ok: false,
      redirected_to_health: false,
    });

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
