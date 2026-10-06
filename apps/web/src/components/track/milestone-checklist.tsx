'use client';

import { useState, useTransition } from 'react';
const DOMAIN_ICON = {
  physical: '🏃‍♀️',
  cognitive: '🧩',
  language: '💬',
  social_emotional: '🧩',
} as const;
import type { MilestoneDomain } from '@/lib/api/types';
import {
  markMilestoneAction,
  unmarkMilestoneAction,
} from '@/app/actions/milestones';
import { trackEvent } from '@/lib/analytics';

/**
 * Track is a checklist, not an assessment. Nothing here ranks, scores or
 * interprets what the parent ticks. It records what she noticed.
 */
export function MilestoneChecklist({
  babyId,
  domains,
}: {
  babyId: string;
  domains: MilestoneDomain[];
}) {
  const initial = new Set(
    domains.flatMap((d) => d.items.filter((i) => i.noticed).map((i) => i.id))
  );
  const [noticed, setNoticed] = useState<Set<string>>(initial);
  const [failed, setFailed] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(milestoneId: string) {
    const wasNoticed = noticed.has(milestoneId);

    // Optimistic. A checkbox that waits on a round trip feels broken.
    setNoticed((prev) => {
      const next = new Set(prev);
      if (wasNoticed) next.delete(milestoneId);
      else next.add(milestoneId);
      return next;
    });
    setFailed(null);

    startTransition(async () => {
      try {
        if (wasNoticed) {
          await unmarkMilestoneAction(babyId, milestoneId);
        } else {
          await markMilestoneAction(babyId, milestoneId);
          trackEvent('milestone_completed');
        }
      } catch {
        // Put it back. Showing a tick that did not save is worse than an error.
        setNoticed((prev) => {
          const next = new Set(prev);
          if (wasNoticed) next.add(milestoneId);
          else next.delete(milestoneId);
          return next;
        });
        setFailed('That did not save. Check your connection and try again.');
      }
    });
  }

  // Domains with no milestones at this checkpoint render nothing, rather than
  // an empty heading that implies data we do not have.
  const populated = domains.filter((d) => d.items.length > 0);

  if (populated.length === 0) {
    return (
      <p className="text-[0.85rem] leading-relaxed text-[var(--text-secondary)]">
        No milestones are loaded for this month yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {failed && (
        <p role="alert" className="rounded-[14px] bg-[var(--surface-terra)] px-4 py-3 text-[13px] text-[var(--text-accent-terracotta)]">
          {failed}
        </p>
      )}

      {populated.map((domain) => {
        const icon = DOMAIN_ICON[domain.domain];
        return (
        <section key={domain.domain}>
          <h2 className="mb-2 flex items-center gap-2 px-1 text-[1.05rem] text-[var(--text-primary)]">
            <span className="text-base" aria-hidden>
              {icon}
            </span>
            {domain.label}
          </h2>
          <ul className="overflow-hidden rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)]">
            {domain.items.map((item, index) => {
              const checked = noticed.has(item.id);
              const checkboxId = `milestone-${item.id}`;
              return (
                <li
                  key={item.id}
                  className={index > 0 ? 'border-t' : undefined}
                  style={index > 0 ? { borderColor: 'var(--border-subtle)' } : undefined}
                >
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 size-5 shrink-0 rounded border-[var(--border-subtle)] accent-[var(--brand-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)] cursor-pointer"
                    />
                    <label htmlFor={checkboxId} className="cursor-pointer text-[0.9rem] leading-snug text-[var(--text-primary)]">
                      {item.title}
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        );
      })}
    </div>
  );
}
