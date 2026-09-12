'use client';

import { useRouter } from 'next/navigation';
import BabyProfileForm from '@/components/baby-profile-form';
import type { BabyProfile } from '@/lib/api/baby';

/**
 * BabyProfileForm deliberately does not navigate on save; it calls `onSaved`
 * and leaves routing to whoever renders it. On the onboarding route the right
 * next step is Home, which now has an age to work from.
 *
 * router.refresh() matters: Home is a server component, so without it the
 * cached render would still show the "Add your baby" empty state.
 */
export function OnboardingForm({ baby }: { baby: BabyProfile | null }) {
  const router = useRouter();

  return (
    <BabyProfileForm
      baby={baby}
      onSaved={() => {
        router.refresh();
        router.push('/home');
      }}
    />
  );
}
