import { createClient } from '@supabase/supabase-js';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-only client that bypasses RLS entirely. Not for anything a
 * request's own session should gate -- only for tables like
 * prompt_versions and audit_events, which are deliberately RLS-enabled
 * with no user-facing policies (see supabase/migrations/0001_init.sql),
 * so only the service role can ever reach them.
 *
 * No cookies, no user session -- this has nothing to do with who is
 * making the request, so it does not belong in the cookie-aware
 * createServerClient().
 */
export function createServiceRoleClient() {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('SUPABASE_SECRET_KEY');

  return createClient(url, key);
}
