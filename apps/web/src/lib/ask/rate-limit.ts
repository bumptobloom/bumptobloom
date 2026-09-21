import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { AskUpstreamError, RateLimitedError } from './errors';

export const RATE_LIMIT_MAX_RUNS_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Throws if this parent has reached the hourly limit of real OpenAI calls.
 *
 * Counts ai_runs specifically, not requests to this route -- a
 * triage-guard redirect or a rejected request never reaches OpenAI, so it
 * never costs anything and should not count against the budget.
 *
 * Count-then-insert is not atomic: simultaneous requests at 19 can all pass.
 * That is accepted -- this is a cost ceiling, not an exact limit.
 *
 * ai_runs has no policy granting authenticated users read access either
 * (only service_role can see it), so this always runs as service role,
 * same as the prompt_versions lookup.
 */
export async function assertUnderRateLimit(parentId: string): Promise<void> {
  const serviceRole = createServiceRoleClient();

  const { data: conversations, error: conversationsError } = await serviceRole
    .from('ai_conversations')
    .select('id')
    .eq('parent_id', parentId);

  if (conversationsError) {
    throw new AskUpstreamError(`Failed to check rate limit: ${conversationsError.message}`);
  }

  const conversationIds = (conversations ?? []).map((row) => row.id);
  if (conversationIds.length === 0) {
    return;
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error: countError } = await serviceRole
    .from('ai_runs')
    .select('id, ai_messages!inner(conversation_id)', { count: 'exact', head: true })
    .in('ai_messages.conversation_id', conversationIds)
    .gte('created_at', windowStart);

  if (countError) {
    throw new AskUpstreamError(`Failed to check rate limit: ${countError.message}`);
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX_RUNS_PER_HOUR) {
    throw new RateLimitedError();
  }
}
