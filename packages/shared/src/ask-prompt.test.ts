import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASK_SYSTEM_PROMPT,
  ASK_SYSTEM_PROMPT_VERSION,
  buildAskSystemPrompt,
} from './ask-prompt.ts';

test('system prompt has an explicit version', () => {
  assert.match(ASK_SYSTEM_PROMPT_VERSION, /^\d{4}\.\d{2}\.\d+$/);
});

test('system prompt requires a warm, plain, non-diagnostic response', () => {
  assert.match(ASK_SYSTEM_PROMPT, /warm, calm, plain-language tone/i);
  assert.match(ASK_SYSTEM_PROMPT, /must never diagnose/i);
  assert.match(ASK_SYSTEM_PROMPT, /Health section/i);
  assert.match(ASK_SYSTEM_PROMPT, /not a substitute for professional medical advice/i);
});

test('system prompt protects identifying information', () => {
  assert.match(
    ASK_SYSTEM_PROMPT,
    /Never request, infer, mention, or repeat/i,
  );
  assert.match(ASK_SYSTEM_PROMPT, /user ID/i);
  assert.match(ASK_SYSTEM_PROMPT, /email address/i);
  assert.match(ASK_SYSTEM_PROMPT, /birth date/i);
});

test('builds a prompt using only the approved baby context', () => {
  const prompt = buildAskSystemPrompt({
    ageMonths: 6,
    developmentalStage: 'infancy',
  });

  assert.match(prompt, /Age in months: 6/);
  assert.match(prompt, /Developmental stage: infancy/);
});