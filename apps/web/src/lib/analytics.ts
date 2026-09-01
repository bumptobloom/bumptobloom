import posthog from 'posthog-js';

// Section 15 Guardrail: Explicit list of prohibited property keys
const DISALLOWED_KEYS = [
  'email',
  'name',
  'first_name',
  'last_name',
  'phone',
  'address',
  'ssn',
  'fever',
  'temperature',
  'symptoms',
  'medical_history',
  'health_status',
  'dob',
  'birth_date',
];

/**
 * Sanitizes event properties to ensure no PII or sensitive health data
 * is transmitted to PostHog per Section 15 compliance standards.
 */
function sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> {
  if (!properties) return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    const lowerKey = key.toLowerCase();
    
    // Drop any forbidden keys
    if (DISALLOWED_KEYS.some((forbidden) => lowerKey.includes(forbidden))) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Analytics Guardrail] Blocked sensitive property key: "${key}"`);
      }
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Privacy-compliant wrapper for PostHog event capture.
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const safeProperties = sanitizeProperties(properties);
  posthog.capture(eventName, safeProperties);
}