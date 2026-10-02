'use client';

/**
 * Reloads the page she was trying to open. The service worker serves the
 * offline page at the original address, so a reload retries that page.
 */
export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] px-6 text-[15px] font-semibold transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-secondary)]"
      style={{ background: 'var(--brand-secondary)', color: '#fffcf4' }}
    >
      Try again
    </button>
  );
}
