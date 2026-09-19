import { deriveAgeMonths } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import type { MilestonesResponse } from './types';
import {
  CHECKPOINTS,
  TRACK_DISCLAIMER,
  buildMilestoneDomains,
  clampMonth,
} from './milestone-utils';

/**
 * `selectedMonth` is the month the parent is looking at, not necessarily her
 * baby's age — Track lets her browse 0-24 (US-02, US-06). Omit it and she gets
 * her baby's current month.
 *
 * Content is still keyed to the five seeded checkpoints, so a month between
 * them resolves to the nearest younger one. That is CDC's own rule for a child
 * whose age falls between checklists, and it is how Vishnu's month-by-month
 * sheet is built, so this stays correct when that dataset replaces the seed.
 */
export async function getMilestones(
  babyId: string,
  selectedMonth?: number
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
  const month =
    selectedMonth === undefined
      ? clampMonth(ageMonths)
      : clampMonth(selectedMonth);

  // Query the month itself. Until 19 Sep the dataset was five CDC checkpoints
  // and this resolved a month to the nearest younger one, so month 3 showed
  // month 2's list. Vishnu's sheet covers every month 0-24, so the mapping is
  // no longer a fallback -- it would just throw away the data we imported.
  const checkpointMonth = month;

  const [milestonesResult, noticedResult] = await Promise.all([
    // retired_at is null is not optional. Rows superseded by a later import are
    // marked rather than deleted, because baby_milestones cascades on delete
    // and that is a mother's own record. Without this filter nothing is ever
    // actually retired -- including the RLS test fixture, which sits at month 0
    // and would otherwise render "Test milestone" on a real Track screen.
    supabase
      .from('milestones')
      .select('id, domain, title, sort_order')
      .eq('checkpoint_month', checkpointMonth)
      .is('retired_at', null)
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
    month,
    babyMonth: clampMonth(ageMonths),
    checkpointMonth,
    checkpoints: [...CHECKPOINTS],
    domains: buildMilestoneDomains(milestonesResult.data ?? [], noticedIds),
    disclaimer: TRACK_DISCLAIMER,
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
    .upsert(
      {
        baby_id: babyId,
        milestone_id: milestoneId,
      },
      {
        onConflict: 'baby_id,milestone_id',
        ignoreDuplicates: true,
      }
    );

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
