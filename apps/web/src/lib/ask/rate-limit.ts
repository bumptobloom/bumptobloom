import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { AskUpstreamError, RateLimitedError } from './errors';

// Per Product's usage-control note: 10 questions per parent per UTC
// calendar day, not the 20/hour we originally guessed.
export const RATE_LIMIT_MAX_QUESTIONS_PER_DAY = 10;

/**
 * Throws if this parent has reached today's (UTC) question budget.
 *
 * Reserves the attempt atomically in the database via reserve_ask_attempt()
 * -- see migration 0009 -- so a burst of concurrent requests cannot all slip
 * through, and so an attempt counts even if the OpenAI call that follows
 * times out or errors. Only ai_runs -- successful completions -- was counted
 * before, which let repeated failures retry the budget forever for free.
 *
 * service_role only: the function itself is not reachable by
 * anon/authenticated at the database level either, since it takes an
 * arbitrary parent_id.
 */
export async function assertUnderRateLimit(parentId: string): Promise<void> {
  const serviceRole = createServiceRoleClient();

  const { data: allowed, error } = await serviceRole.rpc('reserve_ask_attempt', {
    p_parent_id: parentId,
    p_max_per_day: RATE_LIMIT_MAX_QUESTIONS_PER_DAY,
  });

  if (error) {
    throw new AskUpstreamError(`Failed to check rate limit: ${error.message}`);
  }

  if (!allowed) {
    throw new RateLimitedError();
  }
}
