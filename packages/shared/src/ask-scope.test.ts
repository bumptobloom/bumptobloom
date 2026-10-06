import test from 'node:test';
import assert from 'node:assert/strict';
import { isAskQuestionInScope } from './ask-scope.ts';

test('allows supported Ask topics', () => {
  for (const question of [
    'How do I start feeding my baby solid foods?',
    'How can I make bedtime calmer?',
    'How often should I change a diaper?',
    'How can I soothe my crying baby?',
    'How can I get more rest when I feel overwhelmed?',
  ]) {
    assert.equal(isAskQuestionInScope(question), true, question);
  }
});

test('blocks unsupported Ask topics', () => {
  for (const question of [
    'Suggest me some restaurants.',
    'Where is my kid?',
    'What is the capital of France?',
    'What toys should I buy?',
  ]) {
    assert.equal(isAskQuestionInScope(question), false, question);
  }
});

test('matches topics case-insensitively', () => {
  assert.equal(isAskQuestionInScope('HOW CAN I HELP WITH SLEEP?'), true);
});
