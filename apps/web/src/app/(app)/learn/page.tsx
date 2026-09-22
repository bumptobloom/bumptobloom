import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getLearnFeed } from '@/lib/api/learn-feed';
import { MonthStrip } from '@/components/track/month-strip';
import { getMonthTypical } from '@/lib/api/month-guidance';

export const dynamic = 'force-dynamic';

/**
 * Learn — Personalized Guidance Feed. PRD 2.5, Figma frame 04.
 *
 * Built strictly to what the PRD and the final Figma ask for. Two things the
 * old ticket asked for are deliberately absent, because neither appears in
 * either document: category filter chips, and a save/bookmark control.
 */
export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const home = await getHome();

  // Same as Home and Track: there is no designed screen for a parent with no
  // baby, so she goes to onboarding rather than to an invented one.
  if (!home.baby) {
    redirect('/onboarding');
  }

  const { month: monthParam } = await searchParams;
  const parsed = monthParam === undefined ? undefined : Number(monthParam);

  const feed = await getLearnFeed(
    home.baby.id,
    parsed === undefined || Number.isNaN(parsed) ? undefined : parsed,
  );

  const typical = await getMonthTypical(feed.month);

  const viewingOtherMonth = feed.month !== feed.babyMonth;

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
      {/* US-1: "The user sees 'Guidance Feeds' on top." */}
      <h1 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
        GUIDANCE FEEDS
      </h1>

      {/* US-1: a page title indicating the child's age, e.g. "Month 18,
          tailored to you". US-2: the heading updates with the selected month. */}
      <p className="-mt-1 text-[1.15rem] leading-snug text-[var(--text-primary)]">
        Month {feed.month}, tailored to you
      </p>

      <MonthStrip month={feed.month} basePath="/learn" label="Guidance month" />

      {viewingOtherMonth ? (
        <Link
          href="/learn"
          className="-mt-1 self-center text-[0.75rem] text-[var(--text-brand)]"
        >
          Back to {feed.babyMonth} months
        </Link>
      ) : null}

      {/*
        US-1: "The first content has a 'What is Typical' overview, which is the
        same as the Home page displayed."

        Product settled on 15 Sep that what-is-typical comes from Vishnu's
        milestone sheet, not from the five Learn categories. It reads the same
        month_guidance row Home and Track read, so the three screens cannot
        drift apart.
      */}
      <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
        <h2 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
          MONTH {feed.month} &mdash; WHAT IS TYPICAL
        </h2>
        <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          {typical ?? 'Nothing published for this month yet.'}
        </p>
      </article>

      {feed.cards.length === 0 ? (
        <p className="px-1 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          No guidance published for this month yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-20)]">
          {feed.cards.map((card) => (
            <li key={card.id}>
              <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
                {/* US-1: every card carries its guidance category. */}
                <p className="inline-block rounded-full bg-[var(--surface-moss)] px-3 py-1 text-[0.65rem] tracking-[0.06em] text-[var(--text-brand)]">
                  {card.categoryLabel.toUpperCase()}
                </p>

                <h3 className="mt-2.5 text-[1.05rem] leading-snug text-[var(--text-primary)]">
                  {card.title}
                </h3>

                <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
                  {card.body}
                </p>

                {card.safetyNote ? (
                  <p className="mt-2.5 rounded-[14px] bg-[var(--surface-terra)]/55 px-3.5 py-2.5 text-[0.8rem] leading-[1.5] text-[var(--text-accent-terracotta)]">
                    {card.safetyNote}
                  </p>
                ) : null}

                {/*
                  US-4. The source is ruled off from the guidance rather than
                  set in the same block, so it reads as attribution and not as
                  another sentence of advice.
                */}
                <p className="mt-3.5 border-t border-[var(--border-subtle)] pt-2.5 text-[0.72rem] text-[var(--text-secondary)]">
                  Source:{' '}
                  {card.sourceUrl ? (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-brand)] underline underline-offset-2"
                    >
                      {card.sourceLabel}
                    </a>
                  ) : (
                    card.sourceLabel
                  )}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      {/* US-5, verbatim. */}
      <p
        role="note"
        className="mt-2 px-1 text-center text-[0.72rem] leading-[1.6] text-[var(--text-secondary)]"
      >
        {feed.disclaimer}
      </p>
    </section>
  );
}
