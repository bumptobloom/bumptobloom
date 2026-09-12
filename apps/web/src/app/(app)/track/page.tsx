import Link from 'next/link';
import { getHome } from '@/lib/api/home';
import { getMilestones } from '@/lib/api/milestones';
import { MilestoneChecklist } from '@/components/track/milestone-checklist';
import { StandingDisclaimer } from '@/components/standing-disclaimer';

export const dynamic = 'force-dynamic';

export default async function TrackPage() {
  const home = await getHome();

  if (!home.baby) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Track
        </h1>
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Add your baby first so we know which milestones to show.
        </p>
        <Link
          href="/onboarding"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-[var(--radius-button-primary)] px-6 text-[15px] font-semibold"
          style={{ background: 'var(--brand-secondary)', color: '#fffcf4' }}
        >
          Add your baby
        </Link>
      </section>
    );
  }

  const milestones = await getMilestones(home.baby.id);

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Track
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          {milestones.checkpointMonth}-month checkpoint &middot; tick what you have noticed
        </p>
      </header>

      <MilestoneChecklist babyId={home.baby.id} domains={milestones.domains} />

      <StandingDisclaimer text={milestones.disclaimer} />
    </section>
  );
}
