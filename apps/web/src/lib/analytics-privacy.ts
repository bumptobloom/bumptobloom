/**
 * Privacy rules for PostHog analytics (#50).
 *
 * #50: no personal data in event properties, and Vitals data (temperature
 * readings and anything derived from them) excluded from any ad-targeting
 * integration. #126: a fever-range boolean is acceptable, the temperature
 * value and any free text are not. docs/SAFETY.md: fever readings are never
 * used for analytics.
 *
 * So this is an allow-list, not a block-list. A property is sent only if its
 * key is listed below AND its value has the listed type. Everything else is
 * dropped - including a correctly named key carrying the wrong kind of value.
 */

type AllowedType = 'number' | 'string' | 'boolean';

export const ALLOWED_PROPERTIES: Readonly<Record<string, AllowedType>> = {
  month: 'number', // month being viewed, 0-24
  category: 'string', // Learn category
  product_id: 'string', // catalog product id, not personal
};

const MAX_STRING_LENGTH = 64;

export function sanitizeProperties(
  properties?: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  if (!properties) return safe;

  for (const [key, value] of Object.entries(properties)) {
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_PROPERTIES, key)) continue;
    const expected = ALLOWED_PROPERTIES[key];

    if (expected === 'number' && typeof value === 'number' && Number.isFinite(value)) {
      safe[key] = value;
    } else if (expected === 'boolean' && typeof value === 'boolean') {
      safe[key] = value;
    } else if (
      expected === 'string' &&
      typeof value === 'string' &&
      value.length <= MAX_STRING_LENGTH
    ) {
      safe[key] = value;
    }
  }

  return safe;
}

function stripQueryAndHash(value: string): string {
  const cut = value.search(/[?#]/);
  return cut === -1 ? value : value.slice(0, cut);
}

function scrubUrlValues(record: Record<string, unknown> | undefined): void {
  if (!record) return;
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
      record[key] = stripQueryAndHash(value);
    }
  }
}

type AnalyticsEventPayload = {
  properties?: Record<string, unknown>;
  $set?: Record<string, unknown>;
  $set_once?: Record<string, unknown>;
};

/**
 * Runs on every event just before it leaves the browser (PostHog's
 * before_send hook). PostHog attaches URLs automatically - the current page,
 * the referrer, the first page a visitor landed on - and a query string can
 * carry ids, emails or search text. Strip query strings and #fragments from
 * every URL-shaped value, the same protection the Sentry scrubber applies.
 */
export function scrubAnalyticsEvent<T extends AnalyticsEventPayload>(event: T | null): T | null {
  if (!event) return event;
  scrubUrlValues(event.properties);
  scrubUrlValues(event.$set);
  scrubUrlValues(event.$set_once);
  return event;
}
