import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getMilestones } from '@/lib/api/milestones';
import { MilestoneChecklist } from '@/components/track/milestone-checklist';
import { MonthStrip } from '@/components/track/month-strip';
import { getMonthTypical } from '@/lib/api/month-guidance';
import { Callout } from '@/components/ui/callout';

export const dynamic = 'force-dynamic';

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const home = await getHome();

  // Same as Home: no designed screen for a parent with no baby, so send her to
  // onboarding rather than inventing one.
  if (!home.baby) {
    redirect('/onboarding');
  }

  const { month: monthParam } = await searchParams;
  const parsed = monthParam === undefined ? undefined : Number(monthParam);

  const milestones = await getMilestones(
    home.baby.id,
    parsed === undefined || Number.isNaN(parsed) ? undefined : parsed,
  );

  const typical = await getMonthTypical(milestones.month);

  const viewingOtherMonth = milestones.month !== milestones.babyMonth;

  return (
    <section className="flex flex-col gap-[var(--space-20)]">
<<<<<<< HEAD
      <h1 className="type-eyebrow text-[var(--text-secondary)]">
        Milestone tracker
=======
      <h1 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
        MILESTONE TRACKER
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary
      </h1>

      <MonthStrip month={milestones.month} />

      {viewingOtherMonth ? (
        <Link
          href="/track"
          className="type-label -mt-1 self-center text-[var(--text-brand)]"
        >
          Back to {milestones.babyMonth} months
        </Link>
      ) : null}

      {/* US-03. One sentence per month, from month_guidance. */}
<<<<<<< HEAD
      <Callout
        variant="info"
        eyebrow={`${milestones.month} months \u2014 what is typical`}
      >
        {typical ?? 'Nothing published for this month yet.'}
      </Callout>
=======
      <article className="rounded-[var(--radius-16)] border border-[var(--border-card)] bg-[var(--card-primary)] p-[var(--space-20)]">
        <h2 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
          {milestones.month} MONTHS &mdash; WHAT IS TYPICAL
        </h2>
        <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          {typical ?? 'Nothing published for this month yet.'}
        </p>
      </article>
>>>>>>> origin/181-temperature-readings-data-layer-and-todays-summary

      <MilestoneChecklist babyId={home.baby.id} domains={milestones.domains} />

      <p
        role="note"
        className="type-eyebrow mt-[var(--space-8)] px-[var(--space-4)] text-center normal-case tracking-normal text-[var(--text-secondary)]"
      >
        {milestones.disclaimer}
      </p>
    </section>
  );
}
