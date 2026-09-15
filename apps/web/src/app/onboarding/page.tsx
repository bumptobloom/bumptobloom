import { requireUser } from '@/lib/auth/require-user';
import { BrandMark } from '@/components/brand-mark';
import { JourneySelect } from '@/components/journey-select';

export const dynamic = 'force-dynamic';

/**
 * Figma 01, PRD US-03. The journey step. The profile form it leads to lives at
 * /onboarding/profile, so a parent sent here from Home or Track to add a baby
 * is not asked the journey question again.
 */
export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-6 pt-12 pb-10">
        <BrandMark />
        <h1 className="mt-8 mb-4 text-center text-[1.25rem] text-[var(--text-primary)]">
          Where are you in your journey?
        </h1>
        <JourneySelect />
      </div>
    </div>
  );
}
