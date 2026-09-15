import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBaby } from '@/lib/api/baby';
import { requireUser } from '@/lib/auth/require-user';
import { BloomB } from '@/components/brand-mark';
import { OnboardingForm } from '@/components/onboarding-form';

export const dynamic = 'force-dynamic';

/**
 * Figma 02. Per PRD 2.1 this screen carries the mark and the product name but
 * not the tagline — that belongs to the signed-out screens and the journey step.
 *
 * Sits outside the (app) group because it has no tab bar, so it guards itself
 * rather than inheriting the guard from that layout.
 *
 * getBaby() returns null only when the parent genuinely has no baby, and throws
 * on auth and database failures. Those are left to surface: swallowing them
 * would show "Add your baby" to a parent who already has one, and submitting
 * would create a second.
 */
export default async function BabyProfilePage() {
  await requireUser();

  const baby = await getBaby();

  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-6 py-8">
        <div className="flex items-center gap-3">
          <Link
            href="/onboarding"
            aria-label="Back"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-baseline gap-1.5">
            <BloomB className="text-[1.3rem]" />
            <span className="text-[1.05rem] leading-none text-[var(--text-primary)]">
              BumpToBloom
            </span>
          </div>
        </div>

        <h1 className="mt-7 text-[1.35rem] text-[var(--text-primary)]">
          {baby ? 'Baby profile' : 'What’s your baby’s name and date of birth?'}
        </h1>
        <p className="mt-1.5 mb-6 text-[0.85rem] leading-[1.5] text-[var(--text-secondary)]">
          {baby
            ? 'Update your baby’s details below.'
            : 'We use the birth date to work out which milestones to show you.'}
        </p>

        <OnboardingForm baby={baby} />
      </div>
    </div>
  );
}
