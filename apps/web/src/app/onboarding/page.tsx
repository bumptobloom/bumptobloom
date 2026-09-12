import BabyProfileForm from '@/components/baby-profile-form';
import { getBaby } from '@/lib/api/baby';

export const dynamic = 'force-dynamic';

/**
 * The baby profile form from #195 lives here, not at `/`.
 * `/` is Home. A parent with no baby is sent here from Home or Track.
 *
 * This route depends on #195. It will not type-check until that PR is merged,
 * because `components/baby-profile-form` and `lib/api/baby` arrive with it.
 */
export default async function OnboardingPage() {
  const baby = await getBaby().catch(() => null);

  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-5 py-8">
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {baby ? 'Baby profile' : 'Add your baby'}
        </h1>
        <p className="mt-1 mb-6 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
          {baby
            ? 'Update your baby’s details below.'
            : 'We use the birth date to work out which milestones to show you.'}
        </p>
        <BabyProfileForm baby={baby} />
      </div>
    </div>
  );
}
