import posthog from 'posthog-js';
import { sanitizeProperties } from './analytics-privacy';

/**
 * Event names from the tech-stack doc, Section 15 ("Analytics by
 * navigation"), limited to screens that exist in the current app.
 *
 * Not included, and why:
 * - fever_opened, fever_check_completed, fever_result_viewed: the Fever
 *   Checker does not ship (ADR-007). Vitals is a log with no tiers, and its
 *   events wait on #126 because of the #50/#126 rules for Vitals data.
 * - target_clicked, walmart_clicked: Amazon is the only retailer in the MVP.
 * - content_saved: save/bookmark was dropped from Learn (PRD 2.5).
 * - baby_age_viewed: the age is shown on Home, so home_viewed covers it.
 * - activity_completed: pending confirmation that Track still shows activities.
 *
 * Revisit this list once #126 defines the analytics question set.
 */
export type AnalyticsEvent =
  | 'home_viewed'
  | 'milestone_viewed'
  | 'milestone_completed'
  | 'content_viewed'
  | 'recommendations_viewed'
  | 'product_viewed'
  | 'amazon_clicked'
  | 'ask_opened'
  | 'question_submitted'
  | 'answer_received';

/**
 * The only way the app sends an analytics event. Properties pass through the
 * allow-list in analytics-privacy.ts first, so anything not explicitly
 * allowed - health values, free text, personal data - never leaves.
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, sanitizeProperties(properties));
}
