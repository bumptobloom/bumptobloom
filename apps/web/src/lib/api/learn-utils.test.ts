import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEARN_CATEGORY_LABELS,
  LEARN_DISCLAIMER,
  MAX_LEARN_MONTH,
  MIN_LEARN_MONTH,
  categoryLabel,
  clampLearnMonth,
  sortByCategory,
  splitSafetyNote,
} from './learn-utils.ts';

test('clampLearnMonth keeps navigation inside 0-24 (US-2)', () => {
  assert.equal(clampLearnMonth(0), 0);
  assert.equal(clampLearnMonth(18), 18);
  assert.equal(clampLearnMonth(24), 24);
  // Outside the range, in both directions.
  assert.equal(clampLearnMonth(-1), MIN_LEARN_MONTH);
  assert.equal(clampLearnMonth(99), MAX_LEARN_MONTH);
  // A fractional age floors to the month she is in, not the one she is nearing.
  assert.equal(clampLearnMonth(18.9), 18);
  // ?month=abc arrives as NaN and must not blank the screen.
  assert.equal(clampLearnMonth(Number.NaN), MIN_LEARN_MONTH);
  assert.equal(clampLearnMonth(Number.POSITIVE_INFINITY), MIN_LEARN_MONTH);
});

test('the five MVP categories are exactly the ones PRD 2.5 names, in order', () => {
  assert.deepEqual(Object.keys(LEARN_CATEGORY_LABELS), [
    'feeding',
    'sleep',
    'crying_soothing',
    'diaper_digestion',
    'mom_wellbeing',
  ]);
  assert.deepEqual(Object.values(LEARN_CATEGORY_LABELS), [
    'Feeding',
    'Sleeping',
    'Crying & Soothing',
    'Diaper & Digestion',
    'Mom’s Well-Being',
  ]);
});

test('an unrecognised category is shown, not dropped', () => {
  assert.equal(categoryLabel('feeding'), 'Feeding');
  assert.equal(categoryLabel('developmental'), 'developmental');
});

test('sortByCategory follows the PRD order and sorts unknowns last', () => {
  const cards = [
    { category: 'mom_wellbeing' },
    { category: 'developmental' },
    { category: 'feeding' },
    { category: 'crying_soothing' },
  ];
  assert.deepEqual(
    sortByCategory(cards).map((c) => c.category),
    ['feeding', 'crying_soothing', 'mom_wellbeing', 'developmental'],
  );
  // Sorting must not mutate the caller's array.
  assert.equal(cards[0].category, 'mom_wellbeing');
});

test('splitSafetyNote separates the seeded safety line from the guidance', () => {
  const seeded =
    'Offer breast milk or infant formula only. Feed when baby shows hunger.\n\n' +
    '**Safety / Escalation Note:**\n' +
    'Call your pediatrician if feeding is difficult.';

  const split = splitSafetyNote(seeded);
  assert.equal(
    split.body,
    'Offer breast milk or infant formula only. Feed when baby shows hunger.',
  );
  assert.equal(split.safetyNote, 'Call your pediatrician if feeding is difficult.');
  // No markdown leaks into either half.
  assert.ok(!split.body.includes('**'));
  assert.ok(!split.safetyNote?.includes('**'));
});

test('splitSafetyNote leaves a body with no marker untouched', () => {
  const plain = 'Place baby on their back on a firm, flat sleep surface.';
  assert.deepEqual(splitSafetyNote(plain), {
    body: plain,
    safetyNote: null,
  });
  assert.deepEqual(splitSafetyNote(''), { body: '', safetyNote: null });
});

test('a marker with nothing after it does not render an empty note block', () => {
  const trailing = 'Guidance copy.\n\n**Safety / Escalation Note:**\n   ';
  const split = splitSafetyNote(trailing);
  assert.equal(split.body, 'Guidance copy.');
  assert.equal(split.safetyNote, null);
});

test('the US-5 disclaimer is carried verbatim', () => {
  assert.equal(
    LEARN_DISCLAIMER,
    'Educational purposes only. Resources are selected from trusted sources, ' +
      'but do not replace guidance from your child’s pediatrician or ' +
      'other qualified healthcare professionals.',
  );
});
