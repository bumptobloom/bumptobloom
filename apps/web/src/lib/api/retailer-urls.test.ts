import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RETAILER_SLUGS,
  buildRetailerLinks,
  buildRetailerUrl,
  encodeSearchTerms,
} from './retailer-urls.ts';

test('the example from the issue comes out exactly', () => {
  assert.equal(buildRetailerUrl('amazon', 'belly oil'), 'https://www.amazon.com/s?k=belly+oil');
});

test('each retailer has its own search template', () => {
  assert.equal(buildRetailerUrl('target', 'sippy cup'), 'https://www.target.com/s?searchTerm=sippy+cup');
  assert.equal(buildRetailerUrl('walmart', 'sippy cup'), 'https://www.walmart.com/search?q=sippy+cup');
});

test('spaces become + and extra whitespace is dropped', () => {
  assert.equal(encodeSearchTerms('  board   books\tset '), 'board+books+set');
});

test('punctuation is encoded so it cannot break the query (#95 done-when)', () => {
  // & would start a new parameter, # would cut the URL short, + would read as a space.
  assert.equal(encodeSearchTerms('Oil & Balm'), 'Oil+%26+Balm');
  assert.equal(encodeSearchTerms('Size #2'), 'Size+%232');
  assert.equal(encodeSearchTerms('0-3m + 3-6m'), '0-3m+%2B+3-6m');
  assert.equal(encodeSearchTerms('what? 50%'), 'what%3F+50%25');
  assert.equal(encodeSearchTerms('cup/straw=yes'), 'cup%2Fstraw%3Dyes');
});

test('the encoded search reads back as the original words', () => {
  const terms = "Mama's Oil & Balm #2 (4-Pack) 50% + more";
  const url = new URL(buildRetailerUrl('amazon', terms));
  assert.equal(url.searchParams.get('k'), terms);
});

test('non-English characters survive the round trip', () => {
  const url = new URL(buildRetailerUrl('walmart', 'bébé crème'));
  assert.equal(url.searchParams.get('q'), 'bébé crème');
});

test('every product gets all three retailers (#95 done-when)', () => {
  const links = buildRetailerLinks('Silicone Teether');
  assert.deepEqual(links.map((l) => l.slug), ['amazon', 'target', 'walmart']);
  assert.deepEqual(RETAILER_SLUGS, ['amazon', 'target', 'walmart']);
  for (const link of links) {
    assert.ok(link.url.startsWith('https://'));
    assert.equal(new URL(link.url).searchParams.size, 1, 'one search parameter, nothing else');
  }
});

test('a stored hand-picked search wins when it points at that retailer', () => {
  const stored = { amazon: 'https://www.amazon.com/s?k=baby+teether+silicone' };
  const links = buildRetailerLinks('Silicone Teether', stored);
  assert.equal(links[0].url, stored.amazon);
  // The other two are still built, not left out.
  assert.equal(links[1].url, 'https://www.target.com/s?searchTerm=Silicone+Teether');
});

test('a stored URL on the wrong site or over http is ignored and rebuilt', () => {
  const links = buildRetailerLinks('Teether', {
    amazon: 'https://example.com/redirect?to=amazon',
    target: 'http://www.target.com/s?searchTerm=teether',
    walmart: 'not a url',
  });
  assert.deepEqual(
    links.map((l) => l.url),
    [
      'https://www.amazon.com/s?k=Teether',
      'https://www.target.com/s?searchTerm=Teether',
      'https://www.walmart.com/search?q=Teether',
    ]
  );
});
