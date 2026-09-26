import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Captures errors thrown in route handlers, Server Components, and Server
// Actions - not just the client-side ones instrumentation-client.ts catches.
export const onRequestError = Sentry.captureRequestError;
