import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MAX_TRACK_MONTH, MIN_TRACK_MONTH } from '@/lib/api/milestone-utils';
import { cn } from '@/lib/utils';

const WINDOW = 6;

/**
 * Figma 06 (Track) and Figma 04 (Learn). Six months at a time with the selected
 * one ringed, arrows to step outside the window. Navigation is plain links with
 * a `month` query param, so it works without JavaScript and every month is a
 * real URL a parent can land on or share.
 *
 * Track US-02/US-06 and Learn US-2 describe the same control, so it is one
 * component with a `basePath`. Both screens bound it to 0-24, and neither
 * writes anything: changing the viewed month never touches the child's profile.
 */
export function MonthStrip({
  month,
  basePath = '/track',
  label = 'Milestone month',
}: {
  month: number;
  basePath?: string;
  label?: string;
}) {
  const start = Math.min(
    Math.max(MIN_TRACK_MONTH, month - 2),
    MAX_TRACK_MONTH - WINDOW + 1,
  );
  const months = Array.from({ length: WINDOW }, (_, i) => start + i);

  const prev = Math.max(MIN_TRACK_MONTH, month - 1);
  const next = Math.min(MAX_TRACK_MONTH, month + 1);

  return (
    <nav aria-label={label} className="flex items-center gap-1">
      <StepLink
        basePath={basePath}
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
                href={`${basePath}?month=${m}`}
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
        basePath={basePath}
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
  basePath,
  to,
  disabled,
  label,
  children,
}: {
  basePath: string;
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
      href={`${basePath}?month=${to}`}
      aria-label={label}
      className="flex size-8 shrink-0 items-center justify-center text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
    >
      {children}
    </Link>
  );
}
