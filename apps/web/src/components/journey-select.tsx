'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sprout, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Journey = 'expecting' | 'baby-here';

/**
 * PRD US-03. "I'm expecting" is displayed but disabled: pregnancy is out of
 * scope for the MVP (ADR-002), and the PRD asks for it to be visible and
 * greyed rather than removed.
 *
 * No "Coming soon" label. It was suggested in the 2 Sep PRD review, but the
 * final Figma does not show it and Vishnu removed it from the PRD on 15 Sep.
 */
export function JourneySelect() {
  const [selected, setSelected] = useState<Journey | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div
        aria-disabled
        className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-terra)]/30 px-5 py-4 opacity-55"
      >
        <div className="flex items-start gap-3">
          <Sprout className="mt-0.5 size-4 shrink-0 text-[var(--text-brand)]" aria-hidden />
          <div>
            <p className="text-[1.05rem] text-[var(--text-primary)]">I&apos;m expecting</p>
            <p className="mt-0.5 text-[0.8rem] leading-[1.45] text-[var(--text-secondary)]">
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
          'w-full rounded-3xl border px-5 py-4 text-left transition',
          selected === 'baby-here'
            ? 'border-[var(--text-brand)] bg-[var(--surface-moss)] ring-2 ring-[var(--text-brand)]/25'
            : 'border-[var(--border-card)] bg-[var(--card-primary)]',
        )}
      >
        <div className="flex items-start gap-3">
          <Flower2 className="mt-0.5 size-4 shrink-0 text-[var(--text-accent-terracotta)]" aria-hidden />
          <div>
            <p className="text-[1.05rem] text-[var(--text-primary)]">My baby is here</p>
            <p className="mt-0.5 text-[0.8rem] leading-[1.45] text-[var(--text-secondary)]">
              Follow milestones from birth to 24 months
            </p>
          </div>
        </div>
      </button>

      <Button
        type="button"
        disabled={selected !== 'baby-here'}
        onClick={() => router.push('/onboarding/profile')}
        className="mt-2 h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
      >
        Continue
      </Button>

      <p className="pt-1 text-center text-[0.75rem] text-[var(--text-secondary)]">
        You can update this anytime in your profile settings.
      </p>
    </div>
  );
}
