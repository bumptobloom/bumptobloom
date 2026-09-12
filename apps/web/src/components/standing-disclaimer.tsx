import { STANDING_DISCLAIMER } from '@/lib/api/types';

/**
 * ADR-007. This text is not decoration. It ships on every screen that shows
 * developmental or health information, and it does not get shortened.
 */
export function StandingDisclaimer({ text = STANDING_DISCLAIMER }: { text?: string }) {
  return (
    <p
      role="note"
      className="mt-8 rounded-[14px] border border-[var(--border-subtle)] bg-[var(--card-secondary)] px-4 py-3 text-[12px] leading-relaxed"
      style={{ color: 'var(--text-secondary)' }}
    >
      {text}
    </p>
  );
}
