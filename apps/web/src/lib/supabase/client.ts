import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createBrowserClient() {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  return createSupabaseBrowserClient(url, key);
}