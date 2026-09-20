/**
 * Whether a visitor has proved they arrived from a live password-recovery
 * link, PRD US-01 item 4.
 *
 * The rule is a pure function on purpose. The first version of this screen
 * decided inside a React effect and accepted any existing session as proof,
 * which meant a parent already signed in could open /reset-password and get
 * the form, and an expired or already-used link fell back to her cached
 * session and looked like it had worked. Keya caught it reviewing #217.
 *
 * Note what is NOT an input here: whether a session exists. A recovery link is
 * what authorises changing a password WITHOUT knowing the old one, so the only
 * things that count as proof are this attempt's own evidence -- a successful
 * code exchange, or Supabase reporting PASSWORD_RECOVERY.
 */

export interface RecoveryInputs {
  /** `error` / `error_description` on the URL: Supabase rejected the link. */
  urlError: string | null;
  /** The `code` query parameter from the recovery link. */
  code: string | null;
  /** Result of exchanging that code. null while still in flight. */
  exchange: 'ok' | 'failed' | null;
  /** Supabase fired PASSWORD_RECOVERY for this page load. */
  sawRecoveryEvent: boolean;
  /** We have waited long enough for an event that never came. */
  timedOut: boolean;
}

export type RecoveryState = 'pending' | 'verified' | 'invalid';

export function resolveRecoveryState(input: RecoveryInputs): RecoveryState {
  // Supabase already told us the link is bad.
  if (input.urlError) return 'invalid';

  // No link, no reset. Reaching this page directly is not a recovery attempt,
  // however legitimately the visitor is signed in.
  if (!input.code) return 'invalid';

  // Proof from this attempt.
  if (input.sawRecoveryEvent) return 'verified';
  if (input.exchange === 'ok') return 'verified';

  // The client's own detectSessionInUrl may have consumed the code before we
  // exchanged it, in which case our exchange fails but PASSWORD_RECOVERY is
  // still on its way. Wait for it rather than guessing either direction.
  if (input.exchange === 'failed') {
    return input.timedOut ? 'invalid' : 'pending';
  }

  return 'pending';
}
