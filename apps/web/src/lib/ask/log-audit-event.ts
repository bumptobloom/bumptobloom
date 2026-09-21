import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { AskAuditPayload } from './classify-openai-error';

export type AskAuditEventType = 'ask_timeout' | 'ask_upstream_error' | 'ask_rate_limited';

/**
 * Writes a failure to audit_events -- unused since Week 0, RLS-enabled
 * with no policies (same treatment as prompt_versions), service role only.
 *
 * This is itself a failure-reporting path: if the write fails, there is
 * nothing more useful to do than log it and move on. It must never throw
 * back into the caller, which is usually already in its own failure path.
 *
 * The payload type has no free-text field on purpose: nothing a parent typed,
 * or that a provider echoed back, can be written here.
 */
export async function logAskAuditEvent(
  eventType: AskAuditEventType,
  actorUserId: string,
  conversationId: string | null,
  payload: AskAuditPayload,
): Promise<void> {
  try {
    const serviceRole = createServiceRoleClient();
    const { error } = await serviceRole.from('audit_events').insert({
      actor_user_id: actorUserId,
      event_type: eventType,
      entity: 'ai_conversations',
      entity_id: conversationId,
      payload,
    });

    if (error) {
      console.error('[ask] Failed to write audit event:', error.message);
    }
  } catch (err) {
    console.error('[ask] Failed to write audit event:', err instanceof Error ? err.message : err);
  }
}
