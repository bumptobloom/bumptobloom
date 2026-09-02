import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Avoid blowing up Next.js build/prerender phase if env vars aren't provided in CI preview
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL) {
      return '';
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}