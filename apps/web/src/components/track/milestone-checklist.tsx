'use client';

import { useState, useTransition } from 'react';
import type { MilestoneDomain } from '@/lib/api/types';
import {
  markMilestoneAction,
  unmarkMilestoneAction,
} from '@/app/actions/milestones';

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
      <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        No milestones are loaded for this checkpoint yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {failed && (
        <p role="alert" className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {failed}
        </p>
      )}

      {populated.map((domain) => (
        <section key={domain.domain}>
          <h2
            className="mb-2 text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            {domain.label}
          </h2>
          <ul
            className="overflow-hidden rounded-[18px] border"
            style={{ background: 'var(--card-primary)', borderColor: 'var(--border-card)' }}
          >
            {domain.items.map((item, index) => {
              const checked = noticed.has(item.id);
              return (
                <li
                  key={item.id}
                  className={index > 0 ? 'border-t' : undefined}
                  style={index > 0 ? { borderColor: 'var(--border-subtle)' } : undefined}
                >
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--brand-secondary)]"
                    />
                    <span
                      className="text-[15px] leading-snug"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
