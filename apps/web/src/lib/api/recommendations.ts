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
  resolveMonth,
  selectProductIds,
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

/**
 * All 16 curated products across the 4 developmental age buckets (0–3, 4–8, 9–14, 15–24 months).
 * Sourced directly from supabase/seed/products.sql and migration 0009.
 */
export const MOCK_PRODUCT_DETAILS: RecommendedProductDetail[] = [
  // 0–3 months
  {
    id: 'a0000001-0000-4000-a000-000000000001',
    name: 'High-Contrast Black & White Art Cards',
    rationale: 'Stimulates early visual development and optic nerve growth before full color perception emerges.',
    description: 'A collection of durable, high-contrast black-and-white visual stimulation cards designed for newborns and young infants.',
    whyHelpful: [
      'Stimulates optic nerve development during early visual milestones',
      'Encourages sustained visual tracking and focus',
      'Provides engaging visual stimulation during tummy time and floor play',
    ],
    indicativePriceCents: 1200,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=high+contrast+baby+art+cards' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=high+contrast+baby+cards' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=high+contrast+baby+cards' },
    ],
  },
  {
    id: 'a0000002-0000-4000-a000-000000000002',
    name: 'Inflatable Tummy Time Water Mat',
    rationale: 'Encourages head lifting and upper-body strength during daily tummy time with interactive visual feedback.',
    description: "A leak-proof, sensory water play mat with floating sea creatures that responds to baby's touch during tummy time.",
    whyHelpful: [
      'Builds neck, shoulder, and core upper-body strength',
      'Introduces tactile and visual cause-and-effect sensations',
      'Makes daily tummy time more engaging and comfortable',
    ],
    indicativePriceCents: 1500,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=tummy+time+water+mat' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=tummy+time+water+mat' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=tummy+time+water+mat' },
    ],
  },
  {
    id: 'a0000003-0000-4000-a000-000000000003',
    name: 'Sound Machine with Constant White Noise',
    rationale: 'Replicates continuous womb sound rhythms to ease sleep transitions and mask abrupt household sounds.',
    description: 'A compact, non-looping white noise sound machine providing constant soothing acoustic backgrounds for infant sleep.',
    whyHelpful: [
      'Recreates calming womb acoustic environments',
      'Masks household noises that can disrupt light newborn sleep cycles',
      'Establishes a predictable, calming sleep association',
    ],
    indicativePriceCents: 2200,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=baby+sound+machine+white+noise' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=baby+white+noise+machine' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=baby+sound+machine' },
    ],
  },
  {
    id: 'a0000004-0000-4000-a000-000000000004',
    name: 'Organic Cotton Muslin Burp Cloths (4-Pack)',
    rationale: 'Gentle, breathable cotton absorbs frequent newborn spit-ups without irritating delicate newborn skin.',
    description: 'Multi-layered, absorbent organic cotton muslin cloths designed for frequent feeding, burping, and daily cleanups.',
    whyHelpful: [
      'Ultra-soft breathable weave protects sensitive newborn skin',
      'High absorbency manages spit-ups and drool during and after feedings',
      'Durable fabric withstands frequent daily laundering',
    ],
    indicativePriceCents: 1400,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=organic+cotton+muslin+burp+cloths' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=muslin+burp+cloths' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=muslin+burp+cloths' },
    ],
  },

  // 4–8 months
  {
    id: 'a0000005-0000-4000-a000-000000000005',
    name: '100% Food-Grade Silicone Baby Teether',
    rationale: 'Relieves gum pressure during early tooth eruption while encouraging two-handed grasping and oral motor exploration.',
    description: 'A flexible, BPA-free textured silicone teether designed with easy-grip handles for teething infants.',
    whyHelpful: [
      'Soothes sore, tender gums during early tooth eruption',
      'Encourages two-handed grasping and bilateral coordination',
      'Promotes safe oral motor exploration and sensory integration',
    ],
    indicativePriceCents: 900,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=silicone+baby+teether' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=silicone+baby+teether' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=silicone+baby+teether' },
    ],
  },
  {
    id: 'a0000006-0000-4000-a000-000000000006',
    name: 'Ergonomic Silicone Starter Spoon Set',
    rationale: 'Soft-tipped, shallow silicone bowl protects sensitive gums as baby explores puree and puree-to-finger food transitions.',
    description: 'Ergonomically contoured silicone feeding spoons with shallow bowls designed for early self-feeding and assisted puree transitions.',
    whyHelpful: [
      'Soft-edged silicone protects tender gums and emerging teeth',
      'Shallow spoon bowl allows easy food removal for beginner eaters',
      'Contoured grip supports comfortable parent-assisted and baby self-feeding',
    ],
    indicativePriceCents: 1000,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=silicone+baby+starter+spoons' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=baby+silicone+spoons' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=silicone+baby+spoons' },
    ],
  },
  {
    id: 'a0000007-0000-4000-a000-000000000007',
    name: 'Textured Sensory Rattle Ball',
    rationale: 'Develops hand-eye coordination, palmar grasp, and auditory tracking through light rattles and varied surface textures.',
    description: 'A lightweight, easy-to-grasp flexible ball featuring varied sensory textures and gentle rattling chime sounds.',
    whyHelpful: [
      'Develops palmar grasp and finger dexterity',
      'Promotes auditory localization and tracking',
      'Encourages rolling, reaching, and early gross motor movement',
    ],
    indicativePriceCents: 1100,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=sensory+rattle+ball+baby' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=baby+sensory+ball' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=baby+sensory+rattle+ball' },
    ],
  },
  {
    id: 'a0000008-0000-4000-a000-000000000008',
    name: 'Soft Fabric Crinkle Peek-a-Boo Book',
    rationale: 'Engages tactile and auditory curiosity while introducing early interactive routines through crinkle pages.',
    description: 'An interactive, chew-safe soft fabric book with crinkly pages, lift-the-flap elements, and high-contrast patterns.',
    whyHelpful: [
      'Introduces early interactive peek-a-boo routines',
      'Stimulates auditory and tactile sensory processing',
      'Durable, chewable fabric supports early book handling',
    ],
    indicativePriceCents: 1300,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=soft+crinkle+baby+book' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=soft+crinkle+book' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=soft+crinkle+baby+book' },
    ],
  },

  // 9–14 months
  {
    id: 'a0000009-0000-4000-a000-000000000009',
    name: 'Weighted Straw Silicone Open/Trainer Cup',
    rationale: 'Promotes mature swallowing mechanics and oral muscle coordination during the transition from bottles to cups.',
    description: 'A spill-resistant training cup with a 360-degree weighted straw and removable handles to support open cup learning.',
    whyHelpful: [
      'Encourages mature swallowing patterns and lip closure',
      'Handles support two-handed grasping and drinking independence',
      'Weighted straw enables drinking from any angle',
    ],
    indicativePriceCents: 1200,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=weighted+straw+baby+trainer+cup' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=baby+straw+training+cup' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=baby+trainer+straw+cup' },
    ],
  },
  {
    id: 'a0000010-0000-4000-a000-000000000010',
    name: 'Wooden Push Walker & Activity Center',
    rationale: 'Provides a stable base to build confidence, balance, and leg strength for babies pulling up and taking first steps.',
    description: 'A sturdy wooden push wagon with integrated sensory gears, bead mazes, and non-slip rubber-trimmed wheels.',
    whyHelpful: [
      'Provides sturdy stability for pulling up and first steps',
      'Strengthens leg muscles and improves balance coordination',
      'Activity center provides engaging sitting and standing play',
    ],
    indicativePriceCents: 3800,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=wooden+push+walker+baby' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=wooden+baby+push+walker' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=wooden+push+walker' },
    ],
  },
  {
    id: 'a0000011-0000-4000-a000-000000000011',
    name: 'Shape Sorting Cube & Stacking Rings',
    rationale: 'Teaches spatial awareness, shape recognition, and fine motor problem-solving through trial-and-error play.',
    description: 'A classic wooden shape-sorting box and ring stacker set designed to build spatial reasoning and cognitive problem-solving.',
    whyHelpful: [
      'Refines pincer grasp and hand-eye coordination',
      'Introduces early shape recognition, sizing, and color concepts',
      'Fosters trial-and-error problem solving and spatial awareness',
    ],
    indicativePriceCents: 1600,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=shape+sorter+cube+baby' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=shape+sorter+toy' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=shape+sorter+toy' },
    ],
  },
  {
    id: 'a0000012-0000-4000-a000-000000000012',
    name: 'Silicone Suction Divided Plate with Grip',
    rationale: 'High walls and non-slip suction base support self-feeding autonomy and pincer grasp refinement with table foods.',
    description: 'A non-toxic divided silicone toddler plate featuring strong table suction and curved inner walls for easy scooping.',
    whyHelpful: [
      'Strong suction base prevents accidental tipping and plate throwing',
      'Curved inner walls assist beginner eaters in scooping table foods',
      'Divided sections keep food separate for selective early eaters',
    ],
    indicativePriceCents: 1400,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=silicone+suction+baby+plate' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=silicone+suction+plate' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=silicone+suction+plate' },
    ],
  },

  // 15–24 months
  {
    id: 'a1111111-1111-4111-a111-111111111111',
    name: 'Toddler Balance Bike',
    rationale: 'Supports balance, coordination and confidence through active outdoor play.',
    description: 'A sturdy, pedal-free balance bike that helps toddlers build balance and steering coordination before moving to pedal bikes.',
    whyHelpful: [
      'Builds balance and bilateral motor coordination',
      'Encourages outdoor physical activity and independence',
      'Boosts confidence and gross motor stability',
    ],
    indicativePriceCents: 4500,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=balance+bike+toddler' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=toddler+balance+bike' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=toddler+balance+bike' },
    ],
  },
  {
    id: 'a2222222-2222-4222-a222-222222222222',
    name: 'First Words Chunky Board Books Set',
    rationale: 'Supports the fast vocabulary growth typical at this age.',
    description: 'A sturdy starter library of chunky board books designed to build early toddler vocabulary through simple, durable pages.',
    whyHelpful: [
      'Introduces essential everyday words and visual naming concepts',
      'Durable, thick cardboard pages withstand curious toddler handling',
      'Fosters positive early parent-child reading habits',
    ],
    indicativePriceCents: 1600,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=board+books+toddler+first+words' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=toddler+board+books' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=toddler+board+books' },
    ],
  },
  {
    id: 'a0000015-0000-4000-a000-000000000015',
    name: 'Large Wooden Building Blocks Set (30 pcs)',
    rationale: 'Fosters creative construction, early engineering concepts, and hand-eye dexterity through stacking and balance.',
    description: 'A set of solid natural wood blocks in assorted geometric shapes for open-ended building, stacking, and spatial play.',
    whyHelpful: [
      'Builds hand-eye dexterity, balance, and spatial reasoning',
      'Encourages open-ended creative and constructive play',
      'Introduces early physics concepts like gravity, balance, and stability',
    ],
    indicativePriceCents: 2400,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=wooden+building+blocks+toddler' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=wooden+blocks+toddler' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=wooden+building+blocks' },
    ],
  },
  {
    id: 'a0000016-0000-4000-a000-000000000005',
    name: 'Non-Slip Toddler Step Stool',
    rationale: 'Promotes self-care autonomy for handwashing, teeth brushing, and independent participation in daily family routines.',
    description: 'A dual-height, non-slip toddler step stool with rubber grip feet designed for bathroom and kitchen sink reach.',
    whyHelpful: [
      'Empowers toddler autonomy in handwashing and teeth brushing routines',
      'Non-slip surface and rubber base provide reliable stability',
      'Lightweight frame allows toddlers to move the stool independently',
    ],
    indicativePriceCents: 1800,
    imageUrl: '',
    retailers: [
      { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/s?k=toddler+step+stool+bathroom' },
      { slug: 'target', name: 'Target', url: 'https://www.target.com/s?searchTerm=toddler+step+stool' },
      { slug: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/search?q=toddler+step+stool' },
    ],
  },
];

export const MOCK_RECOMMENDATIONS: RecommendationsResponse = {
  ageMonths: 18.3,
  bucketLabel: '15-24 months',
  products: MOCK_PRODUCT_DETAILS.slice(12, 16),
  disclaimer: RECOMMENDATIONS_LIST_DISCLAIMER,
};

type ProductRow = {
  id: string;
  name: string;
  rationale: string;
  description: string | null;
  why_helpful: string[] | null;
  indicative_price_cents: number | null;
  image_path: string | null;
  // One retailer per link at runtime; Supabase's inferred type says a list.
  // Accept both rather than trust either.
  product_retailers:
    | { url: string; retailers: { slug: string } | { slug: string }[] | null }[]
    | null;
};

const PRODUCT_COLUMNS =
  'id, name, rationale, description, why_helpful, indicative_price_cents, image_path, product_retailers(url, retailers(slug))';

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
    // The column is nullable; the contract's field is not. Every product in
    // the 0009 catalog is priced, so 0 only appears if a row is missing one.
    indicativePriceCents: row.indicative_price_cents ?? 0,
    // Every product in the 0009 catalog has image_path null today (#225), so
    // this is empty and the screens fall back. Nothing here invents a URL.
    imageUrl: row.image_path ?? '',
    retailers: buildRetailerLinks(row.name, storedUrls),
  };
}

function toProductDetail(row: ProductRow): RecommendedProductDetail {
  return {
    ...toProduct(row),
    description: row.description ?? '',
    whyHelpful: row.why_helpful ?? [],
  };
}

/**
 * Recommended for You (#42 rules, #95 data layer).
 *
 * Age is derived from birth_date every time (corrected age for preterm
 * babies, same as Activities), so the list and the bucket label follow the
 * baby rather than a fixed string. The rules table picks the products and
 * their order; recommendation-rules.ts removes duplicates.
 *
 * `selectedMonth` previews another month (the screen's `?month=`); it is
 * clamped to 0-24 and defaults to the baby's own month. `ageMonths` in the
 * response stays the baby's real age either way - it describes the baby, not
 * the month being viewed - while `bucketLabel` follows the month on screen.
 *
 * Reads go through the signed-in user's client, so RLS decides access: a baby
 * id that is not hers finds nothing and 404s.
 */
export async function getRecommendations(
  babyId: string,
  selectedMonth?: number
): Promise<RecommendationsResponse> {
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
  const month = resolveMonth(ageMonths, selectedMonth);
  const bucket = bucketForAge(month);

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
  const orderedIds = selectProductIds(month, rules);

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

/** One product for the detail screen, including the copy added in 0009. */
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

  return toProductDetail(data as ProductRow);
}
