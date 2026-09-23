import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getLearnFeed } from '@/lib/api/learn-feed';
import { MonthStrip } from '@/components/track/month-strip';
import { getMonthTypical } from '@/lib/api/month-guidance';
import { Callout } from '@/components/ui/callout';

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
      <h1 className="type-eyebrow text-[var(--text-secondary)]">
        Guidance feeds
      </h1>

      {/* US-1: a page title indicating the child's age, e.g. "Month 18,
          tailored to you". US-2: the heading updates with the selected month. */}
      <p className="type-card-title -mt-1 text-[var(--text-primary)]">
        Month {feed.month}, tailored to you
      </p>

      <MonthStrip month={feed.month} basePath="/learn" label="Guidance month" />

      {viewingOtherMonth ? (
        <Link
          href="/learn"
          className="type-label -mt-1 self-center text-[var(--text-brand)]"
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
<<<<<<< HEAD
      <Callout variant="info" eyebrow={`Month ${feed.month} \u2014 what is typical`}>
        {typical ?? 'Nothing published for this month yet.'}
      </Callout>
=======
      <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
        <h2 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
          MONTH {feed.month} &mdash; WHAT IS TYPICAL
        </h2>
        <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          {typical ?? 'Nothing published for this month yet.'}
        </p>
      </article>
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary

      {feed.cards.length === 0 ? (
        <p className="type-body px-[var(--space-4)] text-[var(--text-secondary)]">
          No guidance published for this month yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-20)]">
          {feed.cards.map((card) => (
            <li key={card.id}>
<<<<<<< HEAD
              <Callout variant="neutral">
                {/* US-1: every card carries its guidance category. Pill shape
                    is from frame 04; the type is design's eyebrow role. */}
                <p className="type-eyebrow inline-block rounded-[var(--radius-pill)] bg-[var(--surface-moss)] px-[var(--space-12)] py-[var(--space-4)] text-[var(--text-brand)]">
                  {card.categoryLabel}
=======
              <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
                {/* US-1: every card carries its guidance category. */}
                <p className="inline-block rounded-full bg-[var(--surface-moss)] px-3 py-1 text-[0.65rem] tracking-[0.06em] text-[var(--text-brand)]">
                  {card.categoryLabel.toUpperCase()}
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary
                </p>

                <h3 className="type-small-title text-[var(--text-primary)]">
                  {card.title}
                </h3>

                <p className="type-body text-[var(--text-secondary)]">
                  {card.body}
                </p>

                {/*
                  This is the seeded "Safety / Escalation Note". Design's spec
                  of 20 Sep puts medical and escalation copy in the Safety
                  variant; it used to be styled as Caution, which is the
                  softer, non-urgent one.
                */}
                {card.safetyNote ? (
                  <p className="type-body rounded-[var(--radius-12)] bg-[var(--surface-alert)] px-[var(--space-14)] py-[var(--space-12)] text-[var(--text-alert)]">
                    {card.safetyNote}
                  </p>
                ) : null}

                {/*
                  US-4. The source is ruled off from the guidance rather than
                  set in the same block, so it reads as attribution and not as
                  another sentence of advice.
                */}
                <p className="type-eyebrow border-t border-[var(--border-subtle)] pt-[var(--space-12)] normal-case tracking-normal text-[var(--text-secondary)]">
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
              </Callout>
            </li>
          ))}
        </ul>
      )}

      {/* US-5, verbatim. */}
      <p
        role="note"
        className="type-eyebrow mt-[var(--space-8)] px-[var(--space-4)] text-center normal-case tracking-normal text-[var(--text-secondary)]"
      >
        {feed.disclaimer}
      </p>
    </section>
  );
}
