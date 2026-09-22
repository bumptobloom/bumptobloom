import { TrackPageView } from '@/components/track-page-view';
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
<TrackPageView
  event="milestone_viewed"
  properties={{ month: milestones.month }}
/>

<h1 className="type-eyebrow text-[var(--text-secondary)]">
  Milestone tracker
</h1>