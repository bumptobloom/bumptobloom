import type {
  LearnCategory,
  LearnFeedResponse,
  LearnItem,
  LearnItemDetail,
  SaveContentResult,
} from './types';
import { LEARN_CATEGORIES } from './types';

export * from './types';

export const MOCK_LEARN_ITEMS: LearnItem[] = [
  {
    id: 'l1111111-1111-4111-a111-111111111111',
    category: 'sleep',
    title: 'Naps at 18 months',
    excerpt:
      'Most toddlers at 18 months transition to one afternoon nap lasting 1.5 to 3 hours.',
    sourceLabel: 'CDC-informed guidance',
    sourceUrl: 'https://www.cdc.gov/parents/essentials/structure/routines.html',
    saved: false,
  },
  {
    id: 'l2222222-2222-4222-a222-222222222222',
    category: 'feeding',
    title: 'Self-feeding and finger foods',
    excerpt:
      'Encourage self-feeding with spoons and small cups even when messy. Fine motor practice builds coordination.',
    sourceLabel: 'AAP Nutritional Guidelines',
    sourceUrl: 'https://www.healthychildren.org',
    saved: true,
  },
  {
    id: 'l3333333-3333-4333-a333-333333333333',
    category: 'developmental',
    title: 'Language explosions around 18 months',
    excerpt:
      'Vocabulary expands rapidly. Reading daily and naming objects during play reinforces new words.',
    sourceLabel: 'CDC Learn the Signs. Act Early.',
    sourceUrl: 'https://www.cdc.gov/ncbddd/actearly/milestones/milestones-18mo.html',
    saved: false,
  },
  {
    id: 'l4444444-4444-4444-a444-444444444444',
    category: 'diaper',
    title: 'Signs of readiness for potty introduction',
    excerpt:
      'Recognising cues and showing interest in bathroom routines typically begins between 18 and 24 months.',
    sourceLabel: 'AAP Child Health Guidelines',
    sourceUrl: 'https://www.healthychildren.org',
    saved: false,
  },
];

/**
 * Fetch Learn feed items matched to a baby's age and optional category filter.
 *
 * Requirements:
 * - Filtered server-side to items where baby.ageMonths is within [min_age_month, max_age_month].
 * - When `category` is undefined or 'all', returns all 4 categories.
 * - `saved` state is resolved for the authenticated parent.
 * - Always returns `categories` list so the UI can render filter tabs.
 *
 * @param babyId - UUID of the active baby
 * @param category - Optional category filter ('developmental' | 'feeding' | 'sleep' | 'diaper')
 * @returns Promise<LearnFeedResponse>
 */
export async function getContent(
  babyId: string,
  category?: LearnCategory
): Promise<LearnFeedResponse> {
  const filtered = category
    ? MOCK_LEARN_ITEMS.filter((item) => item.category === category)
    : MOCK_LEARN_ITEMS;

  return {
    items: filtered,
    categories: LEARN_CATEGORIES,
    activeCategory: category || 'all',
  };
}

/**
 * Fetch a single Learn content item with full article body.
 *
 * @param id - UUID of the content item
 * @returns Promise<LearnItemDetail>
 */
export async function getContentItem(id: string): Promise<LearnItemDetail> {
  const item = MOCK_LEARN_ITEMS.find((i) => i.id === id) || MOCK_LEARN_ITEMS[0];

  return {
    ...item,
    body: `Full educational guide for ${item.title}.\n\nThis evidence-based guidance follows standard paediatric milestone schedules. Always discuss any developmental concerns with your child's primary healthcare provider.`,
    minAgeMonth: 12,
    maxAgeMonth: 24,
  };
}

/**
 * Save a Learn content item for the authenticated parent.
 *
 * Implemented as a Server Action in Week 3.
 *
 * @param contentId - UUID of the content item to bookmark
 * @returns Promise<SaveContentResult>
 */
export async function saveContent(contentId: string): Promise<SaveContentResult> {
  return {
    saved: true,
    contentId,
    savedAt: new Date().toISOString(),
  };
}

/**
 * Unsave / remove a Learn content item bookmark for the authenticated parent.
 *
 * Implemented as a Server Action in Week 3.
 *
 * @param contentId - UUID of the content item to unbookmark
 * @returns Promise<SaveContentResult>
 */
export async function unsaveContent(contentId: string): Promise<SaveContentResult> {
  return {
    saved: false,
    contentId,
  };
}

/**
 * Fetch all saved Learn items for the authenticated parent.
 *
 * @param babyId - Optional UUID of the active baby to prioritize age relevance
 * @returns Promise<LearnItem[]>
 */
export async function getSavedContent(babyId?: string): Promise<LearnItem[]> {
  void babyId;
  return MOCK_LEARN_ITEMS.filter((item) => item.saved);
}
