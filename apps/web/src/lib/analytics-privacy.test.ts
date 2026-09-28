import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeProperties, scrubAnalyticsEvent } from './analytics-privacy.ts';

test('sanitizeProperties keeps only allow-listed keys', () => {
  const result = sanitizeProperties({
    month: 6,
    category: 'sleep',
    product_id: 'p1111111',
    temperature: 101.4,
    fever_temp: '101.4F',
    email: 'canary-parent@example.com',
    question: 'CANARY_PARENT_QUESTION is 101 a fever',
    baby_name: 'CANARY_BABY_NAME',
    babyId: 'CANARY_BABY_ID',
  });

  assert.deepEqual(result, { month: 6, category: 'sleep', product_id: 'p1111111' });
});

test('sanitizeProperties drops allow-listed keys carrying the wrong type or long text', () => {
  const result = sanitizeProperties({
    month: '6',
    category: 7,
    product_id: 'x'.repeat(65),
  });

  assert.deepEqual(result, {});
});

test('sanitizeProperties drops non-finite numbers', () => {
  assert.deepEqual(sanitizeProperties({ month: Number.NaN }), {});
  assert.deepEqual(sanitizeProperties({ month: Number.POSITIVE_INFINITY }), {});
});

test('sanitizeProperties handles missing properties', () => {
  assert.deepEqual(sanitizeProperties(undefined), {});
});

test('scrubAnalyticsEvent strips query strings and fragments from every URL', () => {
  const event = {
    properties: {
      $current_url: 'https://app.test/learn?babyId=CANARY_BABY_ID#section',
      $pathname: '/learn',
      $referrer: 'https://app.test/home?email=canary-parent@example.com',
      month: 6,
    },
    $set_once: {
      $initial_referrer: 'https://google.com/search?q=CANARY_PARENT_QUESTION',
    },
  };

  const result = scrubAnalyticsEvent(event);
  const serialized = JSON.stringify(result);

  assert.equal(result?.properties.$current_url, 'https://app.test/learn');
  assert.equal(result?.properties.$referrer, 'https://app.test/home');
  assert.equal(result?.properties.$pathname, '/learn');
  assert.equal(result?.properties.month, 6);
  assert.equal(result?.$set_once.$initial_referrer, 'https://google.com/search');
  assert.equal(serialized.includes('CANARY'), false);
  assert.equal(serialized.includes('canary-parent'), false);
});

test('scrubAnalyticsEvent passes null through', () => {
  assert.equal(scrubAnalyticsEvent(null), null);
});
