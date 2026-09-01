/**
 * API Contract Types for BumpToBloom
 *
 * Frozen at end of Week 1 per docs/API-CONTRACTS.md.
 * UI screens (Pod E) build against these shapes using mocks.
 * Data layer (Pod I) implements queries adhering strictly to these return shapes.
 * Pages never see raw Supabase database rows.
 */

// ============================================================
// COMMON & DISCLAIMERS
// ============================================================

export const STANDING_DISCLAIMER =
  'BumpToBloom is an educational tool, not a medical device. Always consult your paediatrician for clinical concerns.';

// ============================================================
// HOME (Week 2 - Sahasra Miriyala)
// ============================================================

export interface BabySummary {
  id: string;
  name: string;
  birthDate: string; // ISO 8601 date string (YYYY-MM-DD)
  dueDate?: string | null; // ISO 8601 date string, set for preterm babies
  ageMonths: number; // Derived server-side, never stored or cached across days
  ageLabel: string; // e.g. "18 months", "3 weeks", "Newborn"
  avatarUrl: string | null;
}

export interface ThisWeekGuidance {
  contentId: string;
  title: string;
  excerpt: string;
  sourceLabel: string; // Required source attribution (e.g. "CDC Learn the Signs. Act Early.")
  sourceUrl?: string | null;
}

export interface MilestoneProgress {
  noticed: number;
  total: number;
  checkpointMonth: number;
}

export interface HomeData {
  baby: BabySummary | null; // Null if parent has not registered a baby yet
  thisWeek: ThisWeekGuidance | null;
  milestoneProgress: MilestoneProgress | null;
  disclaimer: string;
}

// ============================================================
// LEARN (Week 3 - Sahasra Miriyala)
// ============================================================

/**
 * The 4 canonical Learn categories agreed in the Master Sheet (ADR-002 / DECISIONS.md).
 */
export type LearnCategory = 'developmental' | 'feeding' | 'sleep' | 'diaper';

export const LEARN_CATEGORIES: LearnCategory[] = [
  'developmental',
  'feeding',
  'sleep',
  'diaper',
];

export interface LearnItem {
  id: string;
  category: LearnCategory;
  title: string;
  excerpt: string;
  sourceLabel: string; // Required on every item — cites clinical/educational source
  sourceUrl: string | null;
  saved: boolean; // Computed for authenticated parent
}

export interface LearnItemDetail extends LearnItem {
  body: string; // Full markdown or rich text body
  minAgeMonth: number;
  maxAgeMonth: number;
}

export interface LearnFeedResponse {
  items: LearnItem[];
  categories: LearnCategory[];
  activeCategory?: LearnCategory | 'all';
}

export interface SaveContentResult {
  saved: boolean;
  contentId: string;
  savedAt?: string;
}

// ============================================================
// ACTIVITIES (Week 2 - Sahasra Miriyala)
// ============================================================

export interface ActivityItem {
  id: string;
  title: string;
  description: string | null;
  domain: 'physical' | 'cognitive' | 'language' | 'social_emotional' | null;
  minAgeMonth: number;
  maxAgeMonth: number;
  completed: boolean;
  completedAt: string | null;
}
