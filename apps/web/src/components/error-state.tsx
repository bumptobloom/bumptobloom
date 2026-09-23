import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * The shared empty/error screen, from the four Home error frames in the
 * 22 Sep Figma: 404, 500, offline and slow load.
 *
 * All four are the same layout with a different icon, headline, line and
 * button, so they are one component rather than four near-identical screens.
 * Keep it that way: a fifth state should be a new set of props here.
 *
 * Deliberately says nothing about the baby and shows no health content, so it
 * carries no disclaimer.
 */
export function ErrorState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel: string;
  /** Use one of onAction / actionHref, not both. */
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex size-[180px] items-center justify-center rounded-full bg-[var(--surface-moss)] text-[var(--text-brand)]">
        {icon}
      </span>

      <h1
        className="mt-[var(--space-32)] text-[var(--text-primary)]"
        style={{ font: 'var(--type-card-title)' }}
      >
        {title}
      </h1>

      <p
        className="mt-[var(--space-12)] max-w-[320px] text-[var(--text-secondary)]"
        style={{ font: 'var(--type-body)' }}
      >
        {body}
      </p>

      {actionHref ? (
        <Button
          asChild
          className="mt-[var(--space-28)] h-12 w-full max-w-[280px] rounded-[var(--radius-button-primary)] text-[0.95rem]"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onAction}
          className="mt-[var(--space-28)] h-12 w-full max-w-[280px] rounded-[var(--radius-button-primary)] text-[0.95rem]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
