import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getHome } from '@/lib/api/home';
import { getMilestones } from '@/lib/api/milestones';
import { MilestoneChecklist } from '@/components/track/milestone-checklist';
import { MonthStrip } from '@/components/track/month-strip';

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

  const viewingOtherMonth = milestones.month !== milestones.babyMonth;

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
        MILESTONE TRACKER
      </h1>

      <MonthStrip month={milestones.month} />

      {viewingOtherMonth ? (
        <Link
          href="/track"
          className="-mt-1 self-center text-[0.75rem] text-[var(--text-brand)]"
        >
          Back to {milestones.babyMonth} months
        </Link>
      ) : null}

      {/*
        US-03. The copy per month lives in the milestone dataset Vishnu sent on
        15 Sep, which is not imported yet, so the block renders its heading and
        says plainly that there is nothing published rather than inventing a
        paragraph about a baby's development.
      */}
      <article className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-4">
        <h2 className="text-[0.68rem] tracking-[0.08em] text-[var(--text-secondary)]">
          {milestones.month} MONTHS &mdash; WHAT IS TYPICAL
        </h2>
        <p className="mt-2 text-[0.85rem] leading-[1.55] text-[var(--text-secondary)]">
          Nothing published for this month yet.
        </p>
      </article>

      <MilestoneChecklist babyId={home.baby.id} domains={milestones.domains} />

      <p
        role="note"
        className="mt-2 px-1 text-center text-[0.72rem] leading-[1.6] text-[var(--text-secondary)]"
      >
        {milestones.disclaimer}
      </p>
    </section>
  );
}
