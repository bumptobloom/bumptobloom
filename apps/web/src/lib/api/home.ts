import type { HomeData } from './types';
import { STANDING_DISCLAIMER } from './types';

export * from './types';

/**
 * Mock data matching the frozen API contract for getHome().
 * Pod E can import this directly for prototyping before the Supabase queries land in Week 2.
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
    noticed: 6,
    total: 9,
    checkpointMonth: 18,
  },
  disclaimer: STANDING_DISCLAIMER,
};

/**
 * Fetch home screen data for a baby.
 *
 * Requirements:
 * - Reads happen in a Server Component using the parent's Supabase session.
 * - If `babyId` is omitted, defaults to the parent's first/active baby.
 * - Handles parents with no registered baby gracefully by returning a `HomeData` with `baby: null`.
 * - `ageMonths` is computed server-side from `birth_date` and never cached across days.
 *
 * @param babyId - Optional UUID of the specific baby
 * @returns Promise<HomeData>
 */
export async function getHome(babyId?: string): Promise<HomeData> {
  // Implementation will land in Week 2 (Sahasra Miriyala).
  // Return mock data for Week 1 contract freeze so Pod E (Melvin/Joanna) can build screens immediately.
  if (babyId === 'empty') {
    return {
      baby: null,
      thisWeek: null,
      milestoneProgress: null,
      disclaimer: STANDING_DISCLAIMER,
    };
  }

  return MOCK_HOME_DATA;
}
