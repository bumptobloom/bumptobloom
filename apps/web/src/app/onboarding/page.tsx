import { getBaby } from '@/lib/api/baby';
import { requireUser } from '@/lib/auth/require-user';
import { OnboardingForm } from '@/components/onboarding-form';

export const dynamic = 'force-dynamic';

/**
 * The baby profile form from #195 lives here, not at `/`.
 * `/` is Home. A parent with no baby is sent here from Home or Track.
 *
 * This route sits outside the (app) group because it has no tab bar, so it
 * guards itself rather than inheriting the guard from that layout.
 *
 * getBaby() returns null only when the parent genuinely has no baby, and
 * throws on auth and database failures. Those are left to surface: swallowing
 * them would show the "Add your baby" form to a parent who already has one,
 * and a second baby would be created on submit.
 */
export default async function OnboardingPage() {
  await requireUser();

  const baby = await getBaby();

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
        <OnboardingForm baby={baby} />
      </div>
    </div>
  );
}
