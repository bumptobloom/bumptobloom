import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { dedupeSources } from './dedupe-sources.ts';
import { parseAnswer, parseInline } from './format-answer.ts';

describe('parseInline', () => {
  it('turns **text** into bold segments', () => {
    assert.deepEqual(parseInline('Feed **every 2-3 hours** at night'), [
      { text: 'Feed ', bold: false },
      { text: 'every 2-3 hours', bold: true },
      { text: ' at night', bold: false },
    ]);
  });

  it('leaves plain text alone', () => {
    assert.deepEqual(parseInline('No formatting here.'), [
      { text: 'No formatting here.', bold: false },
    ]);
  });
});

describe('parseAnswer', () => {
  // Shape of the real answer from the PM defect report.
  const crying = [
    'Crying is a normal way for babies to communicate.',
    '',
    '- **Hunger:** Babies may cry when they are ready to eat.',
    '- **Tiredness:** If they need sleep, they may cry.',
    '',
    'If the crying is constant, consider reaching out to your doctor.',
  ].join('\n');

  it('splits the defect example into paragraph, bullet list, paragraph', () => {
    const blocks = parseAnswer(crying);

    assert.equal(blocks.length, 3);
    assert.equal(blocks[0]?.kind, 'paragraph');
    assert.deepEqual(blocks[1], {
      kind: 'list',
      ordered: false,
      items: [
        [
          { text: 'Hunger:', bold: true },
          { text: ' Babies may cry when they are ready to eat.', bold: false },
        ],
        [
          { text: 'Tiredness:', bold: true },
          { text: ' If they need sleep, they may cry.', bold: false },
        ],
      ],
    });
    assert.equal(blocks[2]?.kind, 'paragraph');
  });

  it('never leaves a literal ** in what gets rendered', () => {
    assert.ok(!JSON.stringify(parseAnswer(crying)).includes('**'));
  });

  it('recognises numbered lists', () => {
    assert.deepEqual(parseAnswer('1. Burp the baby\n2. Check the diaper'), [
      {
        kind: 'list',
        ordered: true,
        items: [
          [{ text: 'Burp the baby', bold: false }],
          [{ text: 'Check the diaper', bold: false }],
        ],
      },
    ]);
  });

  it('renders ### headings as a bold line', () => {
    assert.deepEqual(parseAnswer('### Sleep tips'), [
      { kind: 'paragraph', lines: [[{ text: 'Sleep tips', bold: true }]] },
    ]);
  });

  it('keeps consecutive lines in one paragraph', () => {
    assert.deepEqual(parseAnswer('Line one\nLine two'), [
      {
        kind: 'paragraph',
        lines: [
          [{ text: 'Line one', bold: false }],
          [{ text: 'Line two', bold: false }],
        ],
      },
    ]);
  });
});

describe('dedupeSources', () => {
  it('collapses the cdc.gov x5 case from the defect report to one', () => {
    const sources = Array.from({ length: 5 }, (_, i) => ({
      title: 'cdc.gov',
      url: `https://www.cdc.gov/page-${i}`,
    }));

    assert.deepEqual(dedupeSources(sources), [sources[0]]);
  });

  it('keeps the first of each, in order, ignoring case', () => {
    const sources = [
      { title: 'nhs.uk', url: 'https://www.nhs.uk/a' },
      { title: 'healthychildren.org', url: 'https://healthychildren.org/a' },
      { title: 'NHS.uk', url: 'https://www.nhs.uk/b' },
      { title: 'healthychildren.org', url: 'https://healthychildren.org/b' },
    ];

    assert.deepEqual(dedupeSources(sources), [sources[0], sources[1]]);
  });

  it('handles an empty list', () => {
    assert.deepEqual(dedupeSources([]), []);
  });
});
