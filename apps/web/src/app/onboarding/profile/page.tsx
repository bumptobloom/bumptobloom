import { getBaby } from '@/lib/api/baby';
import { requireUser } from '@/lib/auth/require-user';
import { BrandMark } from '@/components/brand-mark';
import { OnboardingForm } from '@/components/onboarding-form';

export const dynamic = 'force-dynamic';

/**
 * Figma 02. The lockup and tagline sit on the page surface; everything else —
 * back link, avatar, heading, fields — lives inside the card, as drawn.
 *
 * Sits outside the (app) group because it has no tab bar, so it guards itself
 * rather than inheriting the guard from that layout.
 *
 * getBaby() returns null only when the parent genuinely has no baby, and throws
 * on auth and database failures. Those are left to surface: swallowing them
 * would show "add your baby" to a parent who already has one, and submitting
 * would create a second.
 */
export default async function BabyProfilePage() {
  await requireUser();

  const baby = await getBaby();

  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-6 pt-12 pb-10">
        <BrandMark />
        <div className="mt-7">
          <OnboardingForm baby={baby} />
        </div>
      </div>
    </div>
  );
}
