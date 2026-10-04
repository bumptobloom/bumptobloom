'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Journey = 'expecting' | 'baby-here';

/**
 * PRD US-03, Figma 01. "I'm expecting" is displayed but disabled: pregnancy is
 * out of scope for the MVP (ADR-002), and the PRD asks for it to be visible
 * and greyed rather than removed.
 *
 * No "Coming soon" label. It was suggested in the 2 Sep PRD review, but the
 * final Figma does not show it and Vishnu removed it from the PRD on 15 Sep.
 *
 * Layout follows the frame: both options, the button and the footnote sit in
 * one card, the options are peach, and titles use the display face.
 */
export function JourneySelect() {
  const [selected, setSelected] = useState<Journey | null>(null);
  const router = useRouter();

  return (
    <div className="rounded-[28px] border border-[var(--border-card)] bg-[var(--card-primary)] px-6 py-7 shadow-[0_10px_30px_rgba(74,60,40,0.08)]">
      <div className="space-y-4">
        <div
          aria-disabled
          className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-terra)] px-4 py-4 opacity-60"
        >
          <div className="flex items-center gap-3">
            <span aria-hidden className="shrink-0 text-xl">
              🌱
            </span>
            <div>
              <p className="text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
                I&apos;m expecting
              </p>
              <p
                className="mt-0.5 text-[var(--text-secondary)]"
                style={{ font: 'var(--type-small-title)' }}
              >
                Track your pregnancy week by week
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelected('baby-here')}
          aria-pressed={selected === 'baby-here'}
          className={cn(
            'w-full rounded-3xl border bg-[var(--surface-terra)] px-4 py-4 text-left transition',
            selected === 'baby-here'
              ? 'border-[var(--text-brand)] ring-2 ring-[var(--text-brand)]/25'
              : 'border-[var(--border-subtle)]',
          )}
        >
          <div className="flex items-center gap-3">
            <span aria-hidden className="shrink-0 text-xl">
              🌸
            </span>
            <div>
              <p className="text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
                My baby is here
              </p>
              <p
                className="mt-0.5 text-[var(--text-primary)]"
                style={{ font: 'var(--type-small-title)' }}
              >
                Follow milestones from birth to 24 months
              </p>
            </div>
          </div>
        </button>
      </div>

      <Button
        type="button"
        disabled={selected !== 'baby-here'}
        onClick={() => router.push('/onboarding/profile')}
        className="mt-6 h-14 w-full rounded-[var(--radius-button-primary)]"
        style={{ font: 'var(--type-card-title)' }}
      >
        Continue
      </Button>

      <p className="mt-4 text-center text-[0.75rem] leading-[1.4] font-semibold text-[var(--text-secondary)]">
        You can update this anytime in your profile settings.
      </p>
    </div>
  );
}
