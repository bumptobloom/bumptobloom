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

export const MOCK_RECOMMENDATIONS: RecommendationsResponse = {
  ageMonths: 18.3,
  bucketLabel: '15-24 months',
  products: [
  {
    id: 'p1111111-1111-4111-a111-111111111111',
    name: 'Stack & Nest Cups',
    rationale: 'Builds motor skills and hand-eye coordination.',
    indicativePriceCents: 1800,
    imageUrl: '',
    emoji: '🥤',
    retailers: [
      {
        slug: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com/s?k=stacking+cups+toddler',
      },
    ],
  },
  {
    id: 'p2222222-2222-4222-a222-222222222222',
    name: 'Balance Bike',
    rationale: 'Supports balance, coordination and confidence.',
    indicativePriceCents: 4500,
    imageUrl: '',
    emoji: '🚲',
    retailers: [
      {
        slug: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com/s?k=balance+bike+toddler',
      },
    ],
  },
  {
    id: 'p3333333-3333-4333-a333-333333333333',
    name: 'First Words Books',
    rationale: 'Encourages language development and early vocabulary.',
    indicativePriceCents: 1600,
    imageUrl: '',
    emoji: '📖',
    retailers: [
      {
        slug: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com/s?k=first+words+books+toddler',
      },
    ],
  },
  {
    id: 'p4444444-4444-4444-a444-444444444444',
    name: 'Shape Sorter Toy',
    rationale: 'Supports problem solving and fine motor skills.',
    indicativePriceCents: 2200,
    imageUrl: '',
    emoji: '🧩',
    retailers: [
      {
        slug: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com/s?k=shape+sorter+toddler',
      },
    ],
  },
],
  disclaimer: RECOMMENDATIONS_LIST_DISCLAIMER,
};

/**
 * Per-product detail data. One entry per product in MOCK_RECOMMENDATIONS,
 * keyed by matching id so getProduct(id) can look up the correct one
 * instead of always returning the same product.
 */
export const MOCK_PRODUCT_DETAILS: RecommendedProductDetail[] = [
  {
    ...MOCK_RECOMMENDATIONS.products[0],
    description: 'A sturdy, pedal-free bike that helps toddlers build balance before moving to a pedal bike.',
    whyHelpful: [
      'Builds balance and coordination',
      'Encourages independence',
      'Boosts confidence and gross motor skills',
    ],
  },
  {
    ...MOCK_RECOMMENDATIONS.products[1],
    description: 'A sturdy starter library that helps toddlers build early vocabulary through simple, durable pages.',
    whyHelpful: [
      'Introduces new words and concepts',
      'Durable pages withstand curious hands',
      'Builds early reading habits',
    ],
  },
];

export async function getRecommendations(_babyId: string): Promise<RecommendationsResponse> {
  console.warn('[getRecommendations] Using stub data - #41/#95 not yet implemented');
  return MOCK_RECOMMENDATIONS;
}

export async function getProduct(id: string): Promise<RecommendedProductDetail> {
  console.warn('[getProduct] Using stub data - #41/#95 not yet implemented');
  const product = MOCK_PRODUCT_DETAILS.find((p) => p.id === id);
  if (!product) {
    notFound();
  }
  return product;
}
