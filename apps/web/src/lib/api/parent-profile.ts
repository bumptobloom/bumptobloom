import { createServerClient } from '@/lib/supabase/server';

/**
 * The parent's stored IANA timezone, or null when it has never been set.
 *
 * Read in the (app) layout purely so TimezoneSync can tell whether the stored
 * zone already matches the device and skip the write when it does. Vitals does
 * its own lookup inside getTodaysTemperatures and does not depend on this.
 */
export async function getParentTimezone(): Promise<string | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('parent_profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .maybeSingle();

  return profile?.timezone ?? null;
}
