'use server';

import { createBaby, updateBaby, type BabyInput, type BabyProfile } from '@/lib/api/baby';

export async function createBabyAction(input: BabyInput): Promise<BabyProfile> {
  return createBaby(input);
}

export async function updateBabyAction(
  babyId: string,
  input: BabyInput
): Promise<BabyProfile> {
  return updateBaby(babyId, input);
}
