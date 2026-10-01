import { notFound } from 'next/navigation';
import type { RecommendationsResponse, RecommendedProductDetail } from './types';

export * from './types';

/**
 * Approved copy for the Recommended list disclaimer, per Sonakshi's review
 * on #211. Deliberately not STANDING_DISCLAIMER - this feature has its own
 * approved wording.
 */
export const RECOMMENDATIONS_LIST_DISCLAIMER =
  'Products chosen with your child in mind. Please review age recommendations, safety information, and product details before purchasing.';

/**
 * Detail-page disclaimer.
 *
 * The affiliate sentence that used to end this ("We may earn a small
 * commission at no extra cost to you") has been removed. We have no affiliate
 * programme: docs/API-CONTRACTS.md and the RetailerLink type both say retailer
 * links are plain search URLs with no affiliate and no tracking, and
 * docs/MEETING-BRIEF.md still lists applying to those programmes as something
 * nobody has done. Telling a parent we earn a commission when we do not is a
 * false statement about money, and it is the kind of claim that is harder to
 * walk back than to never make. If an affiliate programme is ever approved,
 * put the sentence back then.
 */
export const PRODUCT_DETAIL_DISCLAIMER =
  'Products chosen with your child in mind. BumpToBloom does not manufacture, inspect, or guarantee any third-party product. Please check the product’s age and safety information before purchasing.';

/** Age buckets from #42. A month selects the bucket that contains it. */
export const AGE_BUCKETS = [
  { min: 0, max: 3, label: '0-3 months' },
  { min: 4, max: 8, label: '4-8 months' },
  { min: 9, max: 14, label: '9-14 months' },
  { min: 15, max: 24, label: '15-24 months' },
] as const;

export function bucketForMonth(month: number) {
  const clamped = Math.min(24, Math.max(0, Math.floor(month)));
  return AGE_BUCKETS.find((b) => clamped >= b.min && clamped <= b.max) ?? AGE_BUCKETS[0];
}

/**
 * Stub catalogue. Four products, all in the 15-24 bucket, which is the only
 * bucket design gave us copy for.
 *
 * Deliberately NOT returned for every month. The real catalogue is #41
 * (PR #220, sixteen products) and the data layer is #95 (PR #225). Until one
 * of those lands, a month outside 15-24 honestly has nothing to show, and
 * showing these four anyway would tell a mother of a three-month-old that a
 * balance bike was picked for her baby.
 */
const STUB_PRODUCTS: RecommendationsResponse['products'] = [
  {
    id: 'p1111111-1111-4111-a111-111111111111',
    name: 'Stack & Nest Cups',
    rationale: 'Builds motor skills and hand-eye coordination.',
    indicativePriceCents: 1800,
    imageUrl: '',
    emoji: '\u{1F964}',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=stacking+cups+toddler' },
    ],
  },
  {
    id: 'p2222222-2222-4222-a222-222222222222',
    name: 'Balance Bike',
    rationale: 'Supports balance, coordination and confidence.',
    indicativePriceCents: 4500,
    imageUrl: '',
    emoji: '\u{1F6B2}',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=balance+bike+toddler' },
    ],
  },
  {
    id: 'p3333333-3333-4333-a333-333333333333',
    name: 'First Words Books',
    rationale: 'Encourages language development and early vocabulary.',
    indicativePriceCents: 1600,
    imageUrl: '',
    emoji: '\u{1F4D6}',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=first+words+books+toddler' },
    ],
  },
  {
    id: 'p4444444-4444-4444-a444-444444444444',
    name: 'Shape Sorter Toy',
    rationale: 'Supports problem solving and fine motor skills.',
    indicativePriceCents: 2200,
    imageUrl: '',
    emoji: '\u{1F9E9}',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=shape+sorter+toddler' },
    ],
  },
];

export const MOCK_RECOMMENDATIONS: RecommendationsResponse = {
  ageMonths: 18.3,
  bucketLabel: '15-24 months',
  products: STUB_PRODUCTS,
  disclaimer: RECOMMENDATIONS_LIST_DISCLAIMER,
};

/**
 * One detail entry per product, paired by index.
 *
 * The previous version spread products[0] (Stack & Nest Cups) next to the
 * balance bike's description and products[1] (Balance Bike) next to the
 * books', so tapping a cup opened a bike. It also only covered two of the
 * four products, so First Words Books and Shape Sorter Toy both 404'd. Both
 * are fixed here; the descriptions now sit with the product they describe.
 */
export const MOCK_PRODUCT_DETAILS: RecommendedProductDetail[] = [
  {
    ...STUB_PRODUCTS[0],
    description:
      'A set of nesting cups a toddler can stack, sort and knock over again, sized for small hands.',
    whyHelpful: [
      'Builds hand-eye coordination',
      'Introduces size and order through play',
      'Stacks, nests and travels easily',
    ],
  },
  {
    ...STUB_PRODUCTS[1],
    description:
      'A sturdy, pedal-free bike that helps toddlers build balance before moving to a pedal bike.',
    whyHelpful: [
      'Builds balance and coordination',
      'Encourages independence',
      'Boosts confidence and gross motor skills',
    ],
  },
  {
    ...STUB_PRODUCTS[2],
    description:
      'A sturdy starter library that helps toddlers build early vocabulary through simple, durable pages.',
    whyHelpful: [
      'Introduces new words and concepts',
      'Durable pages withstand curious hands',
      'Builds early reading habits',
    ],
  },
  {
    ...STUB_PRODUCTS[3],
    description:
      'A classic sorter with chunky shapes that fit one way, rewarding patience and problem solving.',
    whyHelpful: [
      'Supports problem solving',
      'Strengthens fine motor control',
      'Teaches shapes through repetition',
    ],
  },
];

/**
 * `selectedMonth` is the month the parent is looking at. Omit it and she gets
 * her baby's current month. Nothing here writes, so browsing another month
 * never changes the child's age or profile - same rule as Track and Learn.
 */
export async function getRecommendations(
  _babyId: string,
  selectedMonth?: number,
): Promise<RecommendationsResponse> {
  console.warn('[getRecommendations] Using stub data - #41/#95 not yet implemented');

  const babyMonth = Math.floor(MOCK_RECOMMENDATIONS.ageMonths);
  const month = selectedMonth === undefined ? babyMonth : Math.min(24, Math.max(0, selectedMonth));
  const bucket = bucketForMonth(month);

  return {
    ageMonths: MOCK_RECOMMENDATIONS.ageMonths,
    bucketLabel: bucket.label,
    // Only the 15-24 bucket has copy. Other buckets render an empty state
    // rather than borrowing these four.
    products: bucket.label === '15-24 months' ? STUB_PRODUCTS : [],
    disclaimer: RECOMMENDATIONS_LIST_DISCLAIMER,
  };
}

export async function getProduct(id: string): Promise<RecommendedProductDetail> {
  console.warn('[getProduct] Using stub data - #41/#95 not yet implemented');
  const product = MOCK_PRODUCT_DETAILS.find((p) => p.id === id);
  if (!product) {
    notFound();
  }
  return product;
}
