'use client';

// TEMPORARY - for #131 client source-map verification on the Vercel preview.
// Remove before this PR merges.
export default function SentryTestPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <button
        type="button"
        onClick={() => {
          throw new Error('SENTRY_TEST client error for source-map verification');
        }}
      >
        Trigger Sentry test error
      </button>
    </main>
  );
}
