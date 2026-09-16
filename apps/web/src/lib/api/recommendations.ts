import type { RecommendationsResponse, RecommendedProductDetail } from './types';
import { STANDING_DISCLAIMER } from './types';

export * from './types';

export const MOCK_RECOMMENDATIONS: RecommendationsResponse = {
  ageMonths: 18.3,
  bucketLabel: '15-24 months',
  products: [
    {
      id: 'p1111111-1111-4111-a111-111111111111',
      name: 'Balance Bike',
      rationale: 'Supports balance, coordination and confidence through active outdoor play.',
      indicativePriceCents: 4500,
      imageUrl: '',
      retailers: [
        { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=balance+bike+toddler' },
      ],
    },
    {
      id: 'p2222222-2222-4222-a222-222222222222',
      name: 'Board Books Set',
      rationale: 'Supports the fast vocabulary growth typical at this age.',
      indicativePriceCents: 1600,
      imageUrl: '',
      retailers: [
        { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=board+books+toddler' },
      ],
    },
  ],
  disclaimer: STANDING_DISCLAIMER,
};

export const MOCK_PRODUCT_DETAIL: RecommendedProductDetail = {
  ...MOCK_RECOMMENDATIONS.products[0],
  description: 'A sturdy, pedal-free bike that helps toddlers build balance before moving to a pedal bike.',
  whyHelpful: [
    'Builds balance and coordination',
    'Encourages independence',
    'Boosts confidence and gross motor skills',
  ],
};

export async function getRecommendations(_babyId: string): Promise<RecommendationsResponse> {
  console.warn('[getRecommendations] Using stub data - #41/#95 not yet implemented');
  return MOCK_RECOMMENDATIONS;
}

export async function getProduct(_id: string): Promise<RecommendedProductDetail> {
  console.warn('[getProduct] Using stub data - #41/#95 not yet implemented');
  return MOCK_PRODUCT_DETAIL;
}
