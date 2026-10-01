'use client';

import { useRouter } from 'next/navigation';
import BabyProfileForm from '@/components/baby-profile-form';
import type { BabyProfile } from '@/lib/api/baby';

export function OnboardingForm({ baby }: { baby: BabyProfile | null }) {
  const router = useRouter();

  return (
    <BabyProfileForm
      baby={baby}
      onSaved={(_, photoUploadError) => {
        router.refresh();
        if (photoUploadError) return;
        router.push('/home');
      }}
    />
  );
}