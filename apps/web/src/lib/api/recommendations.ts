import { notFound } from 'next/navigation';
import { calculateBabyAge } from '@btb/shared';
import { createServerClient } from '@/lib/supabase';
import type {
  RecommendationsResponse,
  RecommendedProduct,
  RecommendedProductDetail,
} from './types';
import {
  bucketForAge,
  selectProductIds,
  wholeMonthAge,
  type RecommendationRule,
} from './recommendation-rules';
import { buildRetailerLinks } from './retailer-urls';

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

type ProductRow = {
  id: string;
  name: string;
  rationale: string;
  indicative_price_cents: number | null;
  image_path: string | null;
  // One retailer per link at runtime; Supabase's inferred type says a list.
  // Accept both rather than trust either.
  product_retailers:
    | { url: string; retailers: { slug: string } | { slug: string }[] | null }[]
    | null;
};

const PRODUCT_COLUMNS =
  'id, name, rationale, indicative_price_cents, image_path, product_retailers(url, retailers(slug))';

function toProduct(row: ProductRow): RecommendedProduct {
  const storedUrls: Record<string, string> = {};
  for (const link of row.product_retailers ?? []) {
    const retailer = Array.isArray(link.retailers) ? link.retailers[0] : link.retailers;
    if (retailer?.slug) storedUrls[retailer.slug] = link.url;
  }
  return {
    id: row.id,
    name: row.name,
    rationale: row.rationale,
    // The column is nullable; the contract's field is not. The catalog seed
    // (#41) prices every product, so 0 only appears if a row is missing one.
    indicativePriceCents: row.indicative_price_cents ?? 0,
    imageUrl: row.image_path ?? '',
    retailers: buildRetailerLinks(row.name, storedUrls),
  };
}

/**
 * Recommended for You (#42 rules, #95 data layer).
 *
 * Age is derived from birth_date every time (corrected age for preterm
 * babies, same as Activities). The rules table picks the products and their
 * order; recommendation-rules.ts removes duplicates. Every product comes back
 * with all three retailer links.
 *
 * Reads go through the signed-in user's client, so RLS decides access: a baby
 * id that is not hers finds nothing and 404s.
 */
export async function getRecommendations(babyId: string): Promise<RecommendationsResponse> {
  const supabase = await createServerClient();

  const { data: baby, error: babyError } = await supabase
    .from('babies')
    .select('birth_date, due_date')
    .eq('id', babyId)
    .maybeSingle();

  if (babyError) {
    console.error('[getRecommendations] Database error fetching baby:', babyError.message);
    throw new Error(`Database error fetching baby: ${babyError.message}`);
  }
  if (!baby) {
    notFound();
  }

  const { ageMonths } = calculateBabyAge(baby.birth_date, { dueDate: baby.due_date });
  const bucket = bucketForAge(ageMonths);
  const month = wholeMonthAge(ageMonths);

  const { data: ruleRows, error: rulesError } = await supabase
    .from('product_recommendation_rules')
    .select('product_id, min_age_month, max_age_month, priority')
    .lte('min_age_month', month)
    .gte('max_age_month', month);

  if (rulesError) {
    console.error('[getRecommendations] Database error fetching rules:', rulesError.message);
    throw new Error(`Database error fetching recommendation rules: ${rulesError.message}`);
  }

  const rules: RecommendationRule[] = (ruleRows ?? []).map((r) => ({
    productId: r.product_id,
    minAgeMonth: r.min_age_month,
    maxAgeMonth: r.max_age_month,
    priority: r.priority,
  }));
  const orderedIds = selectProductIds(ageMonths, rules);

  let products: RecommendedProduct[] = [];
  if (orderedIds.length > 0) {
    const { data: productRows, error: productsError } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .in('id', orderedIds);

    if (productsError) {
      console.error('[getRecommendations] Database error fetching products:', productsError.message);
      throw new Error(`Database error fetching products: ${productsError.message}`);
    }

    // The database returns rows in its own order; put them back in rule order.
    const rows = (productRows ?? []) as ProductRow[];
    const byId = new Map(rows.map((row) => [row.id, row]));
    products = orderedIds
      .map((id) => byId.get(id))
      .filter((row): row is ProductRow => row !== undefined)
      .map(toProduct);
  }

  return {
    ageMonths,
    bucketLabel: bucket.label,
    products,
    disclaimer: RECOMMENDATIONS_LIST_DISCLAIMER,
  };
}

/**
 * One product for the detail screen.
 *
 * The detail screen also shows `description` and `whyHelpful`, which have no
 * columns in the products table yet (see the note on RecommendedProductDetail
 * in types.ts). They come back empty rather than as invented copy until the
 * catalog has somewhere to keep them.
 */
export async function getProduct(id: string): Promise<RecommendedProductDetail> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getProduct] Database error:', error.message);
    throw new Error(`Database error fetching product: ${error.message}`);
  }
  if (!data) {
    notFound();
  }

  return {
    ...toProduct(data as ProductRow),
    description: '',
    whyHelpful: [],
  };
}
