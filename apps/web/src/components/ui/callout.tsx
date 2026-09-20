import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The callout / highlight box, to design's spec of 20 Sep.
 *
 * Before this there was no shared component, so every box in the app was
 * written inline on whichever screen needed one and none of them matched.
 * That is what the PMs were seeing. Use this; do not hand-roll another box.
 *
 * Base shape is the same for all four variants: 16px radius, 20px padding,
 * 12px internal gap, full width. Design was explicit that the 24px radius on
 * the Week Info Card and the asymmetric 8/20 padding on the Vitals Summary
 * Card are bugs in the file, not variants -- build to the base shape.
 */
export type CalloutVariant = 'neutral' | 'info' | 'caution' | 'safety';

const VARIANT_CLASSES: Record<CalloutVariant, string> = {
  // The only variant with a border, because it has no tint of its own.
  neutral: 'bg-[var(--card-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]',
  info: 'bg-[var(--surface-moss)] text-[var(--text-primary)]',
  caution: 'bg-[var(--surface-terra)] text-[var(--text-accent-terracotta)]',
  safety: 'bg-[var(--surface-alert)] text-[var(--text-alert)]',
};

const EYEBROW_CLASSES: Record<CalloutVariant, string> = {
  neutral: 'text-[var(--text-secondary)]',
  // Design named this one specifically.
  info: 'text-[var(--text-brand)]',
  caution: 'text-[var(--text-accent-terracotta)]',
  safety: 'text-[var(--text-alert)]',
};

export function Callout({
  variant = 'neutral',
  eyebrow,
  title,
  children,
  className,
}: {
  /** neutral: general content and guidance cards. info: tips, "what's
   *  typical", "why it's helpful". caution: softer, non-urgent notes.
   *  safety: medical and emergency disclaimer copy. */
  variant?: CalloutVariant;
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full flex flex-col rounded-[var(--radius-16)] p-[var(--space-20)] gap-[var(--space-12)]',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn('uppercase tracking-wide', EYEBROW_CLASSES[variant])}
          style={{ font: 'var(--type-eyebrow)' }}
        >
          {eyebrow}
        </p>
      )}
      {title && <p style={{ font: 'var(--type-card-title)' }}>{title}</p>}
      {children && <div style={{ font: 'var(--type-body)' }}>{children}</div>}
    </div>
  );
}
