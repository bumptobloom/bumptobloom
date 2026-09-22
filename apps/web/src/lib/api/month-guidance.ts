import { createServerClient } from '@/lib/supabase';

/**
 * The per-month "What is Typical" overview.
 *
 * One source, three screens: Home's "This week, for you" card (PRD US-004),
 * Track's overview block (US-03), and Learn's first card (US-1, which says it
 * is "the same as the Home page displayed"). It deliberately does NOT come
 * from the `content` table -- that is Learn's five categories, and Product
 * settled on 15 Sep that what-is-typical cannot map onto them.
 *
 * Returns null when nothing is seeded for the month, so every caller can show
 * its empty state rather than inventing a sentence about a baby's development.
 */
export async function getMonthTypical(month: number): Promise<string | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('month_guidance')
    .select('typical')
    .eq('month', month)
    .maybeSingle();

  if (error) {
    // Never fail a whole screen over the guidance sentence. The empty state
    // is a worse experience than the copy, not a broken one.
    console.error('[getMonthTypical] Database error:', error.message);
    return null;
  }

  return data?.typical ?? null;
}
