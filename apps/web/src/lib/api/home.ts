import { createServerClient } from '@/lib/supabase';
import type {
  HomeData,
  ThisWeekGuidance,
} from './types';
import { STANDING_DISCLAIMER } from './types';

export * from './types';

// Seconds per average Gregorian month (ADR-004 / SQL baby_age_months)
const MS_PER_MONTH = 2629746000;
const MS_PER_DAY = 86400000;

/**
 * Local helper to compute ageMonths and ageLabel server-side.
 * Formula matches SQL baby_age_months(): round(extract(epoch from (now() - birth_date)) / 2629746.0, 1)
 */
function deriveBabyAge(birthDateStr: string): { ageMonths: number; ageLabel: string } {
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - birthDate.getTime());
  const diffDays = Math.floor(diffMs / MS_PER_DAY);
  const ageMonths = Math.round((diffMs / MS_PER_MONTH) * 10) / 10;

  let ageLabel: string;
  if (ageMonths <= 0 || diffDays < 7) {
    ageLabel = 'Newborn';
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    ageLabel = weeks <= 1 ? '1 week' : `${weeks} weeks`;
  } else if (ageMonths < 1) {
    ageLabel = 'Newborn';
  } else {
    const floorMonths = Math.floor(ageMonths);
    ageLabel = floorMonths === 1 ? '1 month' : `${floorMonths} months`;
  }

  return { ageMonths, ageLabel };
}

/**
 * Mock data matching the frozen API contract for getHome().
 */
export const MOCK_HOME_DATA: HomeData = {
  baby: {
    id: 'b1111111-1111-4111-a111-111111111111',
    name: 'Emma Rose',
    birthDate: '2025-02-14',
    dueDate: null,
    ageMonths: 18.3,
    ageLabel: '18 months',
    avatarUrl: null,
  },
  thisWeek: {
    contentId: 'c1111111-1111-4111-a111-111111111111',
    title: 'Month 18: what is typical',
    excerpt:
      'By 18 months, toddlers combine words, walk independently, and explore cause and effect. Notice small steps in communication.',
    sourceLabel: 'CDC Learn the Signs. Act Early.',
    sourceUrl: 'https://www.cdc.gov/ncbddd/actearly/milestones/milestones-18mo.html',
  },
  milestoneProgress: {
    noticed: 3,
    total: 5,
    checkpointMonth: 18,
  },
  disclaimer: STANDING_DISCLAIMER,
};

/**
 * Fetch home screen data for a baby using Supabase queries guarded by RLS.
 *
 * Requirements (Week 2 - Sahasra Miriyala):
 * - Reads happen server-side using the parent's Supabase session cookies.
 * - If `babyId` is omitted, defaults to the parent's active/most recent baby.
 * - Explicit column selection (`id, name, birth_date, due_date`).
 * - Avatar URL returned as null pending private bucket design.
 * - Checkpoint list aligned to V1 5-checkpoint schedule: [2, 6, 12, 18, 24].
 * - Milestone total reflects query count (does not invent a fallback when empty).
 * - Proper error separation: missing session returns empty Home, DB errors logged & thrown.
 *
 * @param babyId - Optional UUID of the specific baby
 * @returns Promise<HomeData>
 */
export async function getHome(babyId?: string): Promise<HomeData> {
  const emptyHomeState: HomeData = {
    baby: null,
    thisWeek: null,
    milestoneProgress: null,
    disclaimer: STANDING_DISCLAIMER,
  };

  const supabase = await createServerClient();

  // 1. Session check: unauthenticated requests return empty Home for auth redirect
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return emptyHomeState;
  }

  // 2. Fetch baby row with explicit columns
  let babyQuery = supabase
    .from('babies')
    .select('id, name, birth_date, due_date');

  if (babyId) {
    babyQuery = babyQuery.eq('id', babyId);
  }

  const { data: baby, error: babyError } = await babyQuery
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (babyError) {
    console.error('[getHome] Database error fetching baby profile:', babyError);
    throw new Error(`Database error fetching baby profile: ${babyError.message}`);
  }

  // Genuine empty state: parent signed in, but has not registered a baby yet
  if (!baby) {
    return emptyHomeState;
  }

  // 3. Compute dynamic age from birth_date
  const { ageMonths, ageLabel } = deriveBabyAge(baby.birth_date);
  const currentMonthFloor = Math.floor(ageMonths);

  // V1 5-checkpoint schedule: 2, 6, 12, 18, 24 months
  const checkpoints = [2, 6, 12, 18, 24];
  const checkpointMonth =
    checkpoints.filter((cp) => cp <= currentMonthFloor).pop() ?? checkpoints[0];

  // 4. Batch guidance and milestone queries in parallel
  const [guidanceResult, milestonesResult, noticedResult] = await Promise.all([
    // Guidance: this-week developmental card
    supabase
      .from('content')
      .select('id, title, body, source_label, source_url')
      .eq('published', true)
      .lte('min_age_month', currentMonthFloor)
      .gte('max_age_month', currentMonthFloor)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Milestones for this checkpoint
    supabase
      .from('milestones')
      .select('id')
      .eq('checkpoint_month', checkpointMonth),

    // Baby milestones noticed by parent
    supabase
      .from('baby_milestones')
      .select('milestone_id')
      .eq('baby_id', baby.id),
  ]);

  if (guidanceResult.error) {
    console.error('[getHome] Database error fetching guidance content:', guidanceResult.error);
    throw new Error(`Database error fetching guidance: ${guidanceResult.error.message}`);
  }

  if (milestonesResult.error) {
    console.error('[getHome] Database error fetching milestones:', milestonesResult.error);
    throw new Error(`Database error fetching milestones: ${milestonesResult.error.message}`);
  }

  if (noticedResult.error) {
    console.error('[getHome] Database error fetching noticed milestones:', noticedResult.error);
    throw new Error(`Database error fetching noticed milestones: ${noticedResult.error.message}`);
  }

  // 5. Map guidance content
  const guidanceData = guidanceResult.data;
  const thisWeek: ThisWeekGuidance | null = guidanceData
    ? {
        contentId: guidanceData.id,
        title: guidanceData.title,
        excerpt: guidanceData.body
          ? guidanceData.body.slice(0, 140).trim() +
            (guidanceData.body.length > 140 ? '…' : '')
          : '',
        sourceLabel: guidanceData.source_label,
        sourceUrl: guidanceData.source_url ?? null,
      }
    : null;

  // 6. Map milestone progress (honest total from query data)
  const checkpointMilestoneIds = new Set(
    (milestonesResult.data ?? []).map((m: { id: string }) => m.id)
  );
  const noticedCount = (noticedResult.data ?? []).filter(
    (bm: { milestone_id: string }) => checkpointMilestoneIds.has(bm.milestone_id)
  ).length;

  const totalCount = milestonesResult.data?.length ?? 0;

  return {
    baby: {
      id: baby.id,
      name: baby.name,
      birthDate: baby.birth_date,
      dueDate: baby.due_date ?? null,
      ageMonths,
      ageLabel,
      avatarUrl: null, // Always null pending private storage bucket design
    },
    thisWeek,
    milestoneProgress: {
      noticed: noticedCount,
      total: totalCount,
      checkpointMonth,
    },
    disclaimer: STANDING_DISCLAIMER,
  };
}
