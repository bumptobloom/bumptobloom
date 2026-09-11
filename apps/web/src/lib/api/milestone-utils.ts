import type { MilestoneDomain, MilestoneItem } from './types';

export const CHECKPOINTS = [2, 6, 12, 18, 24] as const;

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
  return (Object.keys(DOMAIN_LABELS) as Array<keyof typeof DOMAIN_LABELS>).map(
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
