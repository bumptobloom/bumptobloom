import 'server-only';
import OpenAI from 'openai';

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-only OpenAI client. The key is read from OPENAI_API_KEY and never
 * passed through anything NEXT_PUBLIC_-prefixed.
 *
 * timeout/maxRetries are set here rather than left at the SDK's defaults
 * (10 minutes, 2 retries) so a slow OpenAI response fails predictably in
 * around 15s, matching docs/API-CONTRACTS.md's documented failure
 * behaviour, instead of retrying and potentially taking 30-45s+ before the
 * caller ever finds out something went wrong.
 */
export function createOpenAIClient() {
  return new OpenAI({
    apiKey: getEnvVar('OPENAI_API_KEY'),
    timeout: 15_000,
    maxRetries: 0,
  });
}
