'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type TextFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Leading glyph, rendered inside the field. */
  icon?: ReactNode;
  /** Renders the eye toggle and manages masking. */
  revealable?: boolean;
  type?: ComponentProps<'input'>['type'];
};

/**
 * The single input treatment used across the signed-out screens: warm fill,
 * leading icon, and — for passwords — the eye toggle the PRD asks for
 * (US-01, US-02) rather than a Show/Hide text button.
 */
export function TextField({
  icon,
  revealable = false,
  className,
  type = 'text',
  ...props
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const resolvedType = revealable ? (revealed ? 'text' : 'password') : type;

  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-secondary)]">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        type={resolvedType}
        className={cn(
          'w-full rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--surface-terra)]/40 py-3',
          'text-[0.9rem] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]',
          'outline-none transition focus:border-[var(--text-brand)] focus:ring-2 focus:ring-[var(--text-brand)]/20',
          icon ? 'pl-10' : 'pl-4',
          revealable ? 'pr-11' : 'pr-4',
          className,
        )}
      />
      {revealable ? (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
