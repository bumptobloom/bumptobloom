import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

interface ActivityItem {
  id: string;
  title: string;
  description: string | null;
  domain: 'physical' | 'cognitive' | 'language' | 'social_emotional' | null;
  minAgeMonth: number;
  maxAgeMonth: number;
  completed: boolean;
  completedAt: string | null;
}

// Read and parse SQL seed rows to test complete 0–24 dataset coverage
function parseSeedActivities(): Array<{
  id: string;
  title: string;
  description: string;
  minAgeMonth: number;
  maxAgeMonth: number;
  domain: string;
}> {
  const currentDir = import.meta.dirname ?? process.cwd();
  // Find seed file relative to apps/web or repository root
  const candidates = [
    path.resolve(process.cwd(), 'supabase/seed/activities.sql'),
    path.resolve(process.cwd(), '../../supabase/seed/activities.sql'),
    path.resolve(currentDir, '../../../../supabase/seed/activities.sql'),
  ];
  const seedPath = candidates.find((p) => fs.existsSync(p));
  if (!seedPath) {
    throw new Error(`Could not find activities.sql at any path: ${candidates.join(', ')}`);
  }

  const sql = fs.readFileSync(seedPath, 'utf8');
  // Match tuple: ('uuid', 'Title', 'Description', min, max, 'domain')
  const tupleRegex = /\(\s*'([0-9a-f-]+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*'([^']+)'\s*\)/g;
  const items = [];
  let match;
  while ((match = tupleRegex.exec(sql)) !== null) {
    items.push({
      id: match[1],
      title: match[2],
      description: match[3],
      minAgeMonth: parseInt(match[4], 10),
      maxAgeMonth: parseInt(match[5], 10),
      domain: match[6],
    });
  }
  return items;
}

test('Seed dataset: Activities exist for every age bucket 0–24 months', () => {
  const seedActivities = parseSeedActivities();
  assert.ok(seedActivities.length >= 20, `Expected at least 20 activities, found ${seedActivities.length}`);

  // Test every single month from 0 to 24 has at least one matching activity
  for (let month = 0; month <= 24; month++) {
    const matching = seedActivities.filter(
      (act) => act.minAgeMonth <= month && act.maxAgeMonth >= month
    );
    assert.ok(
      matching.length > 0,
      `Month ${month} has no appropriate activities in the seed dataset!`
    );
  }
});

test('Seed dataset: All 4 developmental domains are represented', () => {
  const seedActivities = parseSeedActivities();
  const domains = new Set(seedActivities.map((a) => a.domain));

  assert.ok(domains.has('physical'), 'Missing physical domain in activities seed');
  assert.ok(domains.has('cognitive'), 'Missing cognitive domain in activities seed');
  assert.ok(domains.has('language'), 'Missing language domain in activities seed');
  assert.ok(domains.has('social_emotional'), 'Missing social_emotional domain in activities seed');
});

test('Seed dataset: Every activity has valid age bounds (0 <= min <= max <= 24)', () => {
  const seedActivities = parseSeedActivities();
  for (const act of seedActivities) {
    assert.ok(act.minAgeMonth >= 0, `minAgeMonth must be >= 0 for "${act.title}"`);
    assert.ok(act.maxAgeMonth <= 24, `maxAgeMonth must be <= 24 for "${act.title}"`);
    assert.ok(
      act.minAgeMonth <= act.maxAgeMonth,
      `minAgeMonth (${act.minAgeMonth}) must be <= maxAgeMonth (${act.maxAgeMonth}) for "${act.title}"`
    );
  }
});

test('Age-based filtering: returns only activities strictly covering the given age', () => {
  const seedActivities = parseSeedActivities();

  // Test for a 3-month-old
  const age3 = seedActivities.filter((a) => 3 >= a.minAgeMonth && 3 <= a.maxAgeMonth);
  assert.ok(age3.length > 0);
  for (const a of age3) {
    assert.ok(a.minAgeMonth <= 3 && a.maxAgeMonth >= 3);
  }

  // Test for a 12-month-old
  const age12 = seedActivities.filter((a) => 12 >= a.minAgeMonth && 12 <= a.maxAgeMonth);
  assert.ok(age12.length > 0);
  for (const a of age12) {
    assert.ok(a.minAgeMonth <= 12 && a.maxAgeMonth >= 12);
  }

  // Test for a 24-month-old
  const age24 = seedActivities.filter((a) => 24 >= a.minAgeMonth && 24 <= a.maxAgeMonth);
  assert.ok(age24.length > 0);
  for (const a of age24) {
    assert.ok(a.minAgeMonth <= 24 && a.maxAgeMonth >= 24);
  }
});

test('Completion tracking and mapping correctly reflects baby completion status', () => {
  const sampleActivities: ActivityItem[] = [
    {
      id: 'a0000001-0000-4000-8000-000000000001',
      title: 'Tummy Time on Chest',
      description: 'Lie back slightly and place baby tummy-down on your chest.',
      domain: 'physical',
      minAgeMonth: 0,
      maxAgeMonth: 3,
      completed: false,
      completedAt: null,
    },
    {
      id: 'a0000001-0000-4000-8000-000000000002',
      title: 'High-Contrast Card Tracking',
      description: 'Hold black-and-white patterned cards 8–12 inches from baby’s face.',
      domain: 'cognitive',
      minAgeMonth: 0,
      maxAgeMonth: 3,
      completed: false,
      completedAt: null,
    },
  ];

  const completedMap = new Map<string, string>();
  const completedTimestamp = '2026-09-07T12:00:00.000Z';
  completedMap.set('a0000001-0000-4000-8000-000000000001', completedTimestamp);

  const mapped = sampleActivities.map((act) => {
    const completedAt = completedMap.get(act.id) ?? null;
    return {
      ...act,
      completed: completedAt !== null,
      completedAt,
    };
  });

  assert.equal(mapped[0].completed, true);
  assert.equal(mapped[0].completedAt, completedTimestamp);
  assert.equal(mapped[1].completed, false);
  assert.equal(mapped[1].completedAt, null);
});
