import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMilestoneDomains,
  getCheckpoint,
} from './milestone-utils.ts';

test('getCheckpoint returns the correct V1 checkpoint', () => {
  assert.equal(getCheckpoint(0), 2);
  assert.equal(getCheckpoint(1.9), 2);
  assert.equal(getCheckpoint(2), 2);
  assert.equal(getCheckpoint(5.9), 2);
  assert.equal(getCheckpoint(6), 6);
  assert.equal(getCheckpoint(11.9), 6);
  assert.equal(getCheckpoint(12), 12);
  assert.equal(getCheckpoint(17.9), 12);
  assert.equal(getCheckpoint(18), 18);
  assert.equal(getCheckpoint(23.9), 18);
  assert.equal(getCheckpoint(24), 24);
});

test('buildMilestoneDomains returns all four domains', () => {
  const domains = buildMilestoneDomains(
    [
      {
        id: '1',
        domain: 'physical',
        title: 'Rolls over',
      },
      {
        id: '2',
        domain: 'language',
        title: 'Makes sounds',
      },
    ],
    new Set(['1'])
  );

  assert.deepEqual(
    domains.map((domain) => domain.domain),
    ['physical', 'cognitive', 'language', 'social_emotional']
  );

  assert.deepEqual(domains[0].items, [
    {
      id: '1',
      title: 'Rolls over',
      noticed: true,
    },
  ]);

  assert.deepEqual(domains[1].items, []);

  assert.deepEqual(domains[2].items, [
    {
      id: '2',
      title: 'Makes sounds',
      noticed: false,
    },
  ]);

  assert.deepEqual(domains[3].items, []);
});
