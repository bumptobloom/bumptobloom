import { calculateBabyAge } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import type { ActivityItem } from './types';

export * from './types';

/**
 * Fallback / mock activities data matching API contracts.
 */
export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a0000001-0000-4000-8000-000000000001',
    title: 'Tummy Time on Chest',
    description:
      'Lie back slightly and place baby tummy-down on your chest. Make eye contact and talk gently to encourage head lifting.',
    domain: 'physical',
    minAgeMonth: 0,
    maxAgeMonth: 3,
    completed: false,
    completedAt: null,
  },
  {
    id: 'a0000001-0000-4000-8000-000000000002',
    title: 'High-Contrast Card Tracking',
    description:
      'Hold black-and-white patterned cards 8–12 inches from baby’s face and move them slowly from side to side to encourage visual tracking.',
    domain: 'cognitive',
    minAgeMonth: 0,
    maxAgeMonth: 3,
    completed: false,
    completedAt: null,
  },
  {
    id: 'a0000003-0000-4000-8000-000000000001',
    title: 'Peek-a-Boo with a Soft Blanket',
    description:
      'Hide your face or a favourite toy under a light cloth, then reveal it with joyful exclamation to teach object permanence.',
    domain: 'cognitive',
    minAgeMonth: 6,
    maxAgeMonth: 9,
    completed: false,
    completedAt: null,
  },
  {
    id: 'a0000005-0000-4000-8000-000000000001',
    title: 'Chunky Block Tower Building',
    description:
      'Build 3 to 4 block towers together and encourage your toddler to balance blocks without toppling.',
    domain: 'cognitive',
    minAgeMonth: 12,
    maxAgeMonth: 18,
    completed: false,
    completedAt: null,
  },
  {
    id: 'a0000006-0000-4000-8000-000000000001',
    title: 'Two-Word Phrase Prompting',
    description:
      'Expand your child’s single words into short sentences (if they say "car", reply "fast car!" or "blue car goes beep").',
    domain: 'language',
    minAgeMonth: 18,
    maxAgeMonth: 24,
    completed: false,
    completedAt: null,
  },
];

/**
 * Fetch age-appropriate activities for a baby based on derived age and completion status.
 *
 * Requirements (Week 2 - Sahasra Miriyala):
 * - Resolves the baby's birth_date from Supabase to derive dynamic age in months.
 * - Filters activities where min_age_month <= ageMonths <= max_age_month.
 * - Cross-references baby_activities table to populate `completed` and `completedAt`.
 * - If unauthenticated, returns empty array or age-filtered mock activities.
 *
 * @param babyId - Optional UUID of the baby
 * @param ageMonthsOverride - Optional explicit age in months (for previews/filters)
 * @returns Promise<ActivityItem[]>
 */
export async function getActivities(
  babyId?: string,
  ageMonthsOverride?: number
): Promise<ActivityItem[]> {
  const supabase = await createServerClient();

  // 1. Session check: unauthenticated requests return empty array (matching getHome)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // 2. Resolve baby profile and derived age
  let targetAgeMonth: number;
  let resolvedBabyId: string | null = babyId ?? null;

  if (ageMonthsOverride !== undefined) {
    targetAgeMonth = Math.floor(ageMonthsOverride);
  } else {
    let babyQuery = supabase
      .from('babies')
      .select('id, birth_date, due_date');

    if (babyId) {
      babyQuery = babyQuery.eq('id', babyId);
    }

    const { data: baby, error: babyError } = await babyQuery
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (babyError) {
      console.error('[getActivities] Database error fetching baby profile:', babyError);
      throw new Error(`Database error fetching baby profile: ${babyError.message}`);
    }

    if (!baby) {
      return [];
    }

    resolvedBabyId = baby.id;
    const { ageMonths } = calculateBabyAge(baby.birth_date, {
      dueDate: baby.due_date,
    });
    targetAgeMonth = Math.floor(ageMonths);
  }

  // 3. Query activities matching the target age range
  const { data: activitiesData, error: activitiesError } = await supabase
    .from('activities')
    .select('id, title, description, domain, min_age_month, max_age_month')
    .lte('min_age_month', targetAgeMonth)
    .gte('max_age_month', targetAgeMonth)
    .order('min_age_month', { ascending: true });

  if (activitiesError) {
    console.error('[getActivities] Database error fetching activities:', activitiesError);
    throw new Error(`Database error fetching activities: ${activitiesError.message}`);
  }

  if (!activitiesData || activitiesData.length === 0) {
    return [];
  }

  // 4. Query completed activities for this baby (if baby exists)
  const completedMap = new Map<string, string>();
  if (resolvedBabyId) {
    const { data: completedData, error: completedError } = await supabase
      .from('baby_activities')
      .select('activity_id, completed_at')
      .eq('baby_id', resolvedBabyId);

    if (completedError) {
      console.error('[getActivities] Database error fetching completed activities:', completedError);
      throw new Error(`Database error fetching completed activities: ${completedError.message}`);
    }

    if (completedData) {
      for (const item of completedData) {
        completedMap.set(item.activity_id, item.completed_at);
      }
    }
  }

  // 5. Map to ActivityItem[]
  return activitiesData.map((act) => {
    const completedAt = completedMap.get(act.id) ?? null;
    return {
      id: act.id,
      title: act.title,
      description: act.description ?? null,
      domain: act.domain as ActivityItem['domain'],
      minAgeMonth: act.min_age_month,
      maxAgeMonth: act.max_age_month,
      completed: completedAt !== null,
      completedAt,
    };
  });
}

/**
 * Fetch activities filtered strictly by a specific age in months.
 *
 * @param ageMonths - Age in months (0–24)
 * @param babyId - Optional baby ID to attach completion status
 * @returns Promise<ActivityItem[]>
 */
export async function getActivitiesByAge(
  ageMonths: number,
  babyId?: string
): Promise<ActivityItem[]> {
  return getActivities(babyId, ageMonths);
}

/**
 * Mark an activity as completed for a baby.
 *
 * @param babyId - UUID of the baby
 * @param activityId - UUID of the activity
 * @returns Promise<{ completed: boolean; activityId: string; completedAt: string }>
 */
export async function markActivity(
  babyId: string,
  activityId: string
): Promise<{ completed: boolean; activityId: string; completedAt: string }> {
  const supabase = await createServerClient();

  const completedAt = new Date().toISOString();

  const { error } = await supabase
    .from('baby_activities')
    .upsert(
      {
        baby_id: babyId,
        activity_id: activityId,
        completed_at: completedAt,
      },
      { onConflict: 'baby_id, activity_id' }
    );

  if (error) {
    console.error('[markActivity] Database error marking activity complete:', error);
    throw new Error(`Database error marking activity: ${error.message}`);
  }

  return {
    completed: true,
    activityId,
    completedAt,
  };
}

/**
 * Unmark / remove completion status of an activity for a baby.
 *
 * @param babyId - UUID of the baby
 * @param activityId - UUID of the activity
 * @returns Promise<{ completed: boolean; activityId: string }>
 */
export async function unmarkActivity(
  babyId: string,
  activityId: string
): Promise<{ completed: boolean; activityId: string }> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('baby_activities')
    .delete()
    .eq('baby_id', babyId)
    .eq('activity_id', activityId);

  if (error) {
    console.error('[unmarkActivity] Database error unmarking activity:', error);
    throw new Error(`Database error unmarking activity: ${error.message}`);
  }

  return {
    completed: false,
    activityId,
  };
}
