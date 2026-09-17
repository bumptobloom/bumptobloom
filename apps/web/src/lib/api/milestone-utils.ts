import type { MilestoneDomain, MilestoneItem } from './types';

export const CHECKPOINTS = [2, 6, 12, 18, 24] as const;

/**
 * Track shows three domains (PRD 2.6 US-04, confirmed by Katrina and Vishnu on
 * 15 Sep). Social & emotional rows stay in the database and stay unqueried —
 * Vishnu: "keep the rows in the db, we will turn them on after we have a
 * working product". Adding it back is one entry in this array.
 */
export const TRACK_DOMAINS = ['physical', 'cognitive', 'language'] as const;

/** Track's own disclaimer, PRD 2.6 US-07. Not the standing one. */
export const TRACK_DISCLAIMER =
  'Every child is unique and milestones may vary. This feature does not ' +
  'replace guidance from your child\u2019s pediatrician. When in doubt, ' +
  'please reach out to a healthcare professional.';

export const MIN_TRACK_MONTH = 0;
export const MAX_TRACK_MONTH = 24;

/** Clamp any incoming month to the supported range (US-02). */
export function clampMonth(month: number): number {
  if (!Number.isFinite(month)) return MIN_TRACK_MONTH;
  return Math.min(MAX_TRACK_MONTH, Math.max(MIN_TRACK_MONTH, Math.floor(month)));
}

export const DOMAIN_LABELS = {
  physical: 'Physical',
  cognitive: 'Cognitive',
  language: 'Language',
  social_emotional: 'Social & Emotional',
} as const;

type MilestoneRow = {
  id: string;
  domain: keyof typeof DOMAIN_LABELS;
  title: string;
};

export function getCheckpoint(ageMonths: number): number {
  // Deliberately use the 2-month V1 checkpoint for babies younger than 2 months.
  const currentMonth = Math.floor(ageMonths);

  for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
    if (currentMonth >= CHECKPOINTS[i]) {
      return CHECKPOINTS[i];
    }
  }

  return CHECKPOINTS[0];
}

export function buildMilestoneDomains(
  milestones: MilestoneRow[],
  noticedIds: Set<string>
): MilestoneDomain[] {
  return TRACK_DOMAINS.map(
    (domain) => ({
      domain,
      label: DOMAIN_LABELS[domain],
      items: milestones
        .filter((milestone) => milestone.domain === domain)
        .map((milestone): MilestoneItem => ({
          id: milestone.id,
          title: milestone.title,
          noticed: noticedIds.has(milestone.id),
        })),
    })
  );
}
