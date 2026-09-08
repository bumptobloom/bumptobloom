'use server';

import {
  markMilestone,
  unmarkMilestone,
} from '@/lib/api/milestones';

export async function markMilestoneAction(
  babyId: string,
  milestoneId: string
): Promise<void> {
  return markMilestone(babyId, milestoneId);
}

export async function unmarkMilestoneAction(
  babyId: string,
  milestoneId: string
): Promise<void> {
  return unmarkMilestone(babyId, milestoneId);
}
