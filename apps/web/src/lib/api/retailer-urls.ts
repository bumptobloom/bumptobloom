import type { RetailerLink } from './types';

/**
 * Retailer search URLs (#95). Plain search links only: no affiliate
 * programme, no tracking parameters. One template per retailer.
 */

export type RetailerSlug = 'amazon' | 'target' | 'walmart';

interface RetailerTemplate {
  name: string;
  host: string;
  /** Receives search terms that are already encoded. */
  searchUrl: (encodedTerms: string) => string;
}

/** Same three retailers the `retailers` table allows. Order is display order. */
export const RETAILERS: Record<RetailerSlug, RetailerTemplate> = {
  amazon: {
    name: 'Amazon',
    host: 'www.amazon.com',
    searchUrl: (q) => `https://www.amazon.com/s?k=${q}`,
  },
  target: {
    name: 'Target',
    host: 'www.target.com',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${q}`,
  },
  walmart: {
    name: 'Walmart',
    host: 'www.walmart.com',
    searchUrl: (q) => `https://www.walmart.com/search?q=${q}`,
  },
};

export const RETAILER_SLUGS = Object.keys(RETAILERS) as RetailerSlug[];

/**
 * Encode search terms for a query string. Spaces become "+", as in
 * `?k=belly+oil`, and every character that means something in a URL
 * (& # ? + / = %) is percent-encoded, so "Mama's Oil & Balm" stays one search.
 */
export function encodeSearchTerms(terms: string): string {
  return terms
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => encodeURIComponent(word))
    .join('+');
}

export function buildRetailerUrl(slug: RetailerSlug, terms: string): string {
  return RETAILERS[slug].searchUrl(encodeSearchTerms(terms));
}

/** True only for an https link on that retailer's own site. */
function isRetailerUrl(slug: RetailerSlug, url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.host === RETAILERS[slug].host;
  } catch {
    return false;
  }
}

/**
 * A link for every retailer, always all three.
 *
 * The catalog seed can store a hand-picked search per retailer
 * (`product_retailers.url`). When it has one, and it really points at that
 * retailer, it wins. Otherwise the link is built from the product name with
 * the retailer's template, so no product is ever missing a retailer.
 */
export function buildRetailerLinks(
  productName: string,
  storedUrls: Partial<Record<string, string>> = {}
): RetailerLink[] {
  return RETAILER_SLUGS.map((slug) => {
    const stored = storedUrls[slug];
    return {
      slug,
      name: RETAILERS[slug].name,
      url: stored && isRetailerUrl(slug, stored) ? stored : buildRetailerUrl(slug, productName),
    };
  });
}
