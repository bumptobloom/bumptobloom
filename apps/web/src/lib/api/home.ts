import { calculateBabyAge } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import type {
  HomeData,
  ThisWeekGuidance,
} from './types';
import { STANDING_DISCLAIMER } from './types';

export * from './types';

const BABY_AVATARS_BUCKET = 'baby-avatars';
const AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60;
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
 * - Explicit column selection (`id, name, birth_date, due_date, avatar_path`).
 * - Avatar paths remain private; Home returns a one-hour signed URL.
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
    .select('id, name, birth_date, due_date, avatar_path');

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

  let avatarUrl: string | null = null;

  if (baby.avatar_path) {
    const { data: signedAvatar, error: avatarError } = await supabase.storage
      .from(BABY_AVATARS_BUCKET)
      .createSignedUrl(
        baby.avatar_path,
        AVATAR_SIGNED_URL_TTL_SECONDS,
      );

    if (avatarError) {
      console.error('[getHome] Unable to sign baby avatar:', avatarError);
    } else {
      avatarUrl = signedAvatar.signedUrl;
    }
  }

  // Compute age using the shared utility, including preterm correction.
  const { ageMonths, ageLabel } = calculateBabyAge(baby.birth_date, {
    dueDate: baby.due_date,
  });
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
      avatarUrl,
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
