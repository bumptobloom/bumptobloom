import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { appendTranscript } from './append-transcript.ts';

describe('appendTranscript', () => {
  it('fills an empty box with the dictated words', () => {
    assert.equal(appendTranscript('', 'why is my baby crying', 2000), 'why is my baby crying');
  });

  it('adds to what was typed, with exactly one space', () => {
    assert.equal(appendTranscript('My baby  ', 'is not sleeping', 2000), 'My baby is not sleeping');
  });

  it('ignores an empty or whitespace transcript', () => {
    assert.equal(appendTranscript('typed', '   ', 2000), 'typed');
  });

  it('never goes past the input limit', () => {
    assert.equal(appendTranscript('abc', 'defgh', 6), 'abc de');
  });
});
