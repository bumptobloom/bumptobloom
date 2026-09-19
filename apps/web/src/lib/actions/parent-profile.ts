'use server';

import { createServerClient } from '@/lib/supabase/server';

/**
 * Ensures a parent_profiles row exists for the currently authenticated user.
 *
 * Called two ways:
 * 1. From signup, right after auth.signUp(), with fullName from the form.
 * 2. From login, with no fullName - a self-healing check for accounts left
 *    orphaned by a signup that failed after auth.signUp() succeeded but
 *    before this insert completed. Falls back to full_name stored in auth
 *    user_metadata at signup time, then to email, so the NOT NULL
 *    constraint on full_name is never violated even on the recovery path.
 *
 * Idempotent: if a profile already exists, returns success immediately
 * without attempting a second insert. This makes it safe to call on every
 * login, not just after a known failure.
 *
 * userId is deliberately not a parameter - it is derived from the session
 * via getUser() so a server action (a public endpoint) never trusts a
 * caller-supplied id, even though RLS would reject a forged one today.
 */
export async function createParentProfile(fullName?: string) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('[createParentProfile] No authenticated user found:', userError?.message);
    return { success: false as const };
  }

  const { data: existingProfile, error: lookupError } = await supabase
    .from('parent_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (lookupError) {
    console.error('[createParentProfile] Failed to check for existing profile:', lookupError.message);
    return { success: false as const };
  }

  if (existingProfile) {
    return { success: true as const };
  }

  const resolvedFullName =
    fullName ?? user.user_metadata?.full_name ?? user.email ?? 'Parent';

  const { error: insertError } = await supabase
    .from('parent_profiles')
    .insert([{ user_id: user.id, full_name: resolvedFullName }]);

  if (insertError) {
    console.error('[createParentProfile] Failed to create parent profile:', insertError.message);
    return { success: false as const };
  }

  return { success: true as const };
}
