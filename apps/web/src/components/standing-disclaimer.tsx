import { STANDING_DISCLAIMER } from '@/lib/api/types';

/**
 * ADR-007. This text is not decoration. It ships on every screen that shows
 * developmental or health information, and it does not get shortened.
 */
export function StandingDisclaimer({ text = STANDING_DISCLAIMER }: { text?: string }) {
  return (
    <p
      role="note"
      className="px-[var(--space-8)] text-center text-[12px] leading-relaxed"
      style={{ color: 'var(--text-secondary)' }}
    >
      {text}
    </p>
  );
}
