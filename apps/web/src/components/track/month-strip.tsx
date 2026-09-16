import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MAX_TRACK_MONTH, MIN_TRACK_MONTH } from '@/lib/api/milestone-utils';
import { cn } from '@/lib/utils';

const WINDOW = 6;

/**
 * Figma 06. Six months at a time with the selected one ringed, arrows to step
 * outside the window. Navigation is plain links with a `month` query param, so
 * it works without JavaScript and every month is a real URL a parent can land
 * on or share (US-02, US-06).
 */
export function MonthStrip({ month }: { month: number }) {
  const start = Math.min(
    Math.max(MIN_TRACK_MONTH, month - 2),
    MAX_TRACK_MONTH - WINDOW + 1,
  );
  const months = Array.from({ length: WINDOW }, (_, i) => start + i);

  const prev = Math.max(MIN_TRACK_MONTH, month - 1);
  const next = Math.min(MAX_TRACK_MONTH, month + 1);

  return (
    <nav aria-label="Milestone month" className="flex items-center gap-1">
      <StepLink
        to={prev}
        disabled={month === MIN_TRACK_MONTH}
        label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </StepLink>

      <ul className="flex flex-1 items-center justify-between">
        {months.map((m) => {
          const selected = m === month;
          return (
            <li key={m}>
              <Link
                href={`/track?month=${m}`}
                aria-current={selected ? 'true' : undefined}
                className={cn(
                  'flex size-11 flex-col items-center justify-center rounded-full leading-none transition',
                  selected
                    ? 'border border-[var(--text-brand)] text-[var(--text-brand)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                <span className="text-[0.9rem]">{m}</span>
                <span className="mt-0.5 text-[0.6rem]">mo</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <StepLink
        to={next}
        disabled={month === MAX_TRACK_MONTH}
        label="Next month"
      >
        <ChevronRight className="size-4" />
      </StepLink>
    </nav>
  );
}

function StepLink({
  to,
  disabled,
  label,
  children,
}: {
  to: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center text-[var(--border-subtle)]"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/track?month=${to}`}
      aria-label={label}
      className="flex size-8 shrink-0 items-center justify-center text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
    >
      {children}
    </Link>
  );
}
