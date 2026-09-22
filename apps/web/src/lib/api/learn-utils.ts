/**
 * Pure helpers for Learn's guidance feed (PRD 2.5). Kept free of imports so
 * they can be unit tested the same way milestone-utils is, and so the screen's
 * rules live somewhere a reviewer can read without a database.
 */

export const MIN_LEARN_MONTH = 0;
export const MAX_LEARN_MONTH = 24;

/** PRD 2.5 US-5, verbatim. Not the standing disclaimer, and not shortened. */
export const LEARN_DISCLAIMER =
  'Educational purposes only. Resources are selected from trusted sources, ' +
  'but do not replace guidance from your child’s pediatrician or other ' +
  'qualified healthcare professionals.';

/**
 * The five MVP categories named in PRD 2.5 US-1, in the order the PRD lists
 * them. Keys are the database values; PR #204 moves the `content` check
 * constraint onto exactly these.
 */
export const LEARN_CATEGORY_LABELS: Record<string, string> = {
  feeding: 'Feeding',
  sleep: 'Sleeping',
  crying_soothing: 'Crying & Soothing',
  diaper_digestion: 'Diaper & Digestion',
  mom_wellbeing: 'Mom’s Well-Being',
};

export const LEARN_CATEGORY_ORDER = Object.keys(LEARN_CATEGORY_LABELS);

export interface LearnFeedCard {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  body: string;
  /** The seeded rows carry a safety note inside `body`. Kept separate so the
   *  card can show it as its own line instead of printing raw asterisks. */
  safetyNote: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
}

export interface LearnFeed {
  /** The month being viewed. Not necessarily the baby's age. */
  month: number;
  /** The baby's actual month, so the screen can offer a way back to it. */
  babyMonth: number;
  cards: LearnFeedCard[];
  disclaimer: string;
}

/** Clamp any incoming month to the supported range (US-2: "within 0-24"). */
export function clampLearnMonth(month: number): number {
  if (!Number.isFinite(month)) return MIN_LEARN_MONTH;
  return Math.min(
    MAX_LEARN_MONTH,
    Math.max(MIN_LEARN_MONTH, Math.floor(month)),
  );
}

/**
 * Vishnu's sheet appends a safety line to the card copy, and the seed stores it
 * inside `body` behind a bold marker. Split it so the card renders two
 * paragraphs rather than literal `**`. Nothing is added or reworded -- if the
 * marker is absent the whole body is the guidance.
 */
const SAFETY_MARKER = /\*\*\s*Safety\s*\/\s*Escalation Note:?\s*\*\*/i;

export function splitSafetyNote(body: string): {
  body: string;
  safetyNote: string | null;
} {
  const match = (body ?? '').match(SAFETY_MARKER);
  if (!match || match.index === undefined) {
    return { body: (body ?? '').trim(), safetyNote: null };
  }
  return {
    body: body.slice(0, match.index).trim(),
    safetyNote: body.slice(match.index + match[0].length).trim() || null,
  };
}

/**
 * Order the feed by the PRD's category order. A category we do not recognise
 * sorts last rather than being dropped -- better a visible oddity than a
 * silently missing piece of guidance.
 */
export function sortByCategory<T extends { category: string }>(cards: T[]): T[] {
  const rank = (c: string) => {
    const i = LEARN_CATEGORY_ORDER.indexOf(c);
    return i === -1 ? LEARN_CATEGORY_ORDER.length : i;
  };
  return [...cards].sort((a, b) => rank(a.category) - rank(b.category));
}

export function categoryLabel(category: string): string {
  return LEARN_CATEGORY_LABELS[category] ?? category;
}
