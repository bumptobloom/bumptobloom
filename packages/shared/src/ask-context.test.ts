import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAskBabyContext,
  getDevelopmentalStage,
} from './ask-context.ts';

test('maps age boundaries to the correct developmental stage', () => {
  assert.equal(getDevelopmentalStage(0), 'early infancy');
  assert.equal(getDevelopmentalStage(3.9), 'early infancy');
  assert.equal(getDevelopmentalStage(4), 'infancy');
  assert.equal(getDevelopmentalStage(8.9), 'infancy');
  assert.equal(getDevelopmentalStage(9), 'late infancy');
  assert.equal(getDevelopmentalStage(14.9), 'late infancy');
  assert.equal(getDevelopmentalStage(15), 'toddlerhood');
  assert.equal(getDevelopmentalStage(24), 'toddlerhood');
});

test('builds context containing only age and developmental stage', () => {
  const context = buildAskBabyContext(18.3);

  assert.deepEqual(context, {
    ageMonths: 18.3,
    developmentalStage: 'toddlerhood',
  });

  assert.deepEqual(Object.keys(context).sort(), [
    'ageMonths',
    'developmentalStage',
  ]);

  assert.equal('name' in context, false);
  assert.equal('email' in context, false);
  assert.equal('userId' in context, false);
  assert.equal('babyId' in context, false);
  assert.equal('birthDate' in context, false);
  assert.equal('dueDate' in context, false);
});

test('returns an immutable context object', () => {
  const context = buildAskBabyContext(6);

  assert.equal(Object.isFrozen(context), true);
});

test('rejects invalid ages', () => {
  assert.throws(
    () => buildAskBabyContext(-1),
    /ageMonths must be a non-negative finite number/,
  );

  assert.throws(
    () => buildAskBabyContext(Number.NaN),
    /ageMonths must be a non-negative finite number/,
  );

  assert.throws(
    () => buildAskBabyContext(Number.POSITIVE_INFINITY),
    /ageMonths must be a non-negative finite number/,
  );
});