import { deriveAgeMonths } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import {
  categoryLabel,
  clampLearnMonth,
  LEARN_DISCLAIMER,
  sortByCategory,
  splitSafetyNote,
  type LearnFeed,
  type LearnFeedCard,
} from './learn-utils';

export * from './learn-utils';

/**
 * Learn's month-addressed reader, PRD 2.5.
 *
 * This lives beside `learn.ts` rather than inside it on purpose. `getContent`
 * is Sahasra's frozen contract, `getContent(babyId, category?)`, and it has no
 * month parameter -- but US-2 lets a mother browse any month from 0 to 24
 * independently of her baby's real age, so the screen cannot be built on it as
 * it stands. PR #204 is in review against `learn.ts` right now; editing that
 * file here would hand her a conflict for no reason.
 *
 * When #204 is merged, fold this into `learn.ts` as a month argument on
 * `getContent` and delete this file. One Learn reader, not two.
 */

type ContentRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  source_label: string;
  source_url: string | null;
};

/**
 * `selectedMonth` is the month the parent is looking at. Omit it and she gets
 * her baby's current month. Nothing here writes, so browsing another month
 * cannot change the child's age or profile (US-2).
 */
export async function getLearnFeed(
  babyId: string,
  selectedMonth?: number,
): Promise<LearnFeed> {
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

  const babyMonth = clampLearnMonth(deriveAgeMonths(baby.birth_date));
  const month =
    selectedMonth === undefined ? babyMonth : clampLearnMonth(selectedMonth);

  // The seed bands content by [min_age_month, max_age_month], which is what
  // `content_age_idx` is built for. A month selects the band that contains it.
  const { data, error } = await supabase
    .from('content')
    .select('id, category, title, body, source_label, source_url')
    .eq('published', true)
    .lte('min_age_month', month)
    .gte('max_age_month', month);

  if (error) {
    console.error('[getLearnFeed] Database error fetching content:', error);
    throw new Error(`Database error fetching Learn content: ${error.message}`);
  }

  const cards = sortByCategory(
    (data ?? []).map((row: ContentRow): LearnFeedCard => {
      const split = splitSafetyNote(row.body ?? '');
      return {
        id: row.id,
        category: row.category,
        categoryLabel: categoryLabel(row.category),
        title: row.title,
        body: split.body,
        safetyNote: split.safetyNote,
        sourceLabel: row.source_label,
        sourceUrl: row.source_url,
      };
    }),
  );

  return { month, babyMonth, cards, disclaimer: LEARN_DISCLAIMER };
}
