import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * These two reads must stay as literal `process.env.NEXT_PUBLIC_*` expressions.
 *
 * Next.js inlines NEXT_PUBLIC_* into the browser bundle by statically replacing
 * that exact text at build time. A dynamic lookup like `process.env[name]` has
 * no literal for the bundler to match, so it survives into the browser, where
 * `process.env` is an empty shim and the value is always undefined.
 *
 * This file runs in the browser. Do not refactor these into a helper that takes
 * the variable name as an argument. `server.ts` can do that safely because it
 * reads a real `process.env` at runtime; this file cannot.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!key) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return createSupabaseBrowserClient(url, key);
}
