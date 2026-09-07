import { deriveAgeMonths } from '@btb/shared/src/age';
import { createServerClient } from '@/lib/supabase';
import type { MilestonesResponse } from './types';
import { STANDING_DISCLAIMER } from './types';
import {
  CHECKPOINTS,
  buildMilestoneDomains,
  getCheckpoint,
} from './milestone-utils';

export async function getMilestones(
  babyId: string
): Promise<MilestonesResponse> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: baby, error: babyError } = await supabase
    .from('babies')
    .select('id, birth_date')
    .eq('id', babyId)
    .single();

  if (babyError || !baby) {
    throw new Error('Baby not found');
  }

  const ageMonths = deriveAgeMonths(baby.birth_date);
  const checkpointMonth = getCheckpoint(ageMonths);

  const [milestonesResult, noticedResult] = await Promise.all([
    supabase
      .from('milestones')
      .select('id, domain, title, sort_order')
      .eq('checkpoint_month', checkpointMonth)
      .order('domain')
      .order('sort_order'),

    supabase
      .from('baby_milestones')
      .select('milestone_id')
      .eq('baby_id', babyId),
  ]);

  if (milestonesResult.error) {
    console.error(
      '[getMilestones] Database error fetching milestones:',
      milestonesResult.error
    );
    throw new Error(
      `Database error fetching milestones: ${milestonesResult.error.message}`
    );
  }

  if (noticedResult.error) {
    console.error(
      '[getMilestones] Database error fetching noticed milestones:',
      noticedResult.error
    );
    throw new Error(
      `Database error fetching noticed milestones: ${noticedResult.error.message}`
    );
  }

  const noticedIds = new Set(
    (noticedResult.data ?? []).map(
      (row: { milestone_id: string }) => row.milestone_id
    )
  );

  return {
    checkpointMonth,
    checkpoints: [...CHECKPOINTS],
    domains: buildMilestoneDomains(milestonesResult.data ?? [], noticedIds),
    disclaimer: STANDING_DISCLAIMER,
  };
}

export async function markMilestone(
  babyId: string,
  milestoneId: string
): Promise<void> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { error } = await supabase
    .from('baby_milestones')
    .insert({
      baby_id: babyId,
      milestone_id: milestoneId,
    });

  if (error) {
    console.error('[markMilestone] Database error:', error);
    throw new Error(`Database error marking milestone: ${error.message}`);
  }
}

export async function unmarkMilestone(
  babyId: string,
  milestoneId: string
): Promise<void> {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { error } = await supabase
    .from('baby_milestones')
    .delete()
    .eq('baby_id', babyId)
    .eq('milestone_id', milestoneId);

  if (error) {
    console.error('[unmarkMilestone] Database error:', error);
    throw new Error(
      `Database error unmarking milestone: ${error.message}`
    );
  }
}
