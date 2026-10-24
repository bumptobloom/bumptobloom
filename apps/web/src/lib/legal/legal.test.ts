import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TERMS_OF_USE,
  PRIVACY_POLICY,
  CONSUMER_HEALTH_DATA_PRIVACY_POLICY,
  LEGAL_TERMS_VERSION,
} from './index.ts';

test('TERMS_OF_USE has valid metadata and all 18 sections', () => {
  assert.equal(TERMS_OF_USE.id, 'terms-of-use');
  assert.equal(TERMS_OF_USE.effectiveDate, 'October 20, 2026');
  assert.equal(TERMS_OF_USE.lastUpdated, 'October 20, 2026');
  assert.equal(TERMS_OF_USE.contactEmail, 'team.bumptobloom@gmail.com');
  assert.equal(TERMS_OF_USE.contactWebsite, 'bumptobloom.app');
  assert.equal(TERMS_OF_USE.sections.length, 18);

  const sectionTitles = TERMS_OF_USE.sections.map((s) => s.title);
  assert.ok(sectionTitles.includes('About the Service'));
  assert.ok(sectionTitles.includes('Emergencies'));
  assert.ok(sectionTitles.includes('AI-Generated Information'));
  assert.ok(sectionTitles.includes('Temperature Log'));
  assert.ok(sectionTitles.includes('Acceptable Use'));
  assert.ok(sectionTitles.includes('Disclaimers'));
  assert.ok(sectionTitles.includes('Limitation of Liability'));
  assert.ok(sectionTitles.includes('Contact'));
});

test('PRIVACY_POLICY has valid metadata and all 15 sections', () => {
  assert.equal(PRIVACY_POLICY.id, 'privacy-policy');
  assert.equal(PRIVACY_POLICY.effectiveDate, 'October 20, 2026');
  assert.equal(PRIVACY_POLICY.lastUpdated, 'October 20, 2026');
  assert.equal(PRIVACY_POLICY.contactEmail, 'team.bumptobloom@gmail.com');
  assert.equal(PRIVACY_POLICY.sections.length, 15);

  const sectionTitles = PRIVACY_POLICY.sections.map((s) => s.title);
  assert.ok(sectionTitles.includes('Information We Collect'));
  assert.ok(sectionTitles.includes('How We Use Information'));
  assert.ok(sectionTitles.includes('AI and Ask Conversations'));
  assert.ok(sectionTitles.includes('Data Retention and Deletion'));
  assert.ok(sectionTitles.includes('Your Privacy Choices and Rights'));
  assert.ok(sectionTitles.includes('HIPAA'));
  assert.ok(sectionTitles.includes('Contact Us'));
});

test('CONSUMER_HEALTH_DATA_PRIVACY_POLICY has all 11 sections', () => {
  assert.equal(CONSUMER_HEALTH_DATA_PRIVACY_POLICY.id, 'consumer-health-data-privacy-policy');
  assert.equal(CONSUMER_HEALTH_DATA_PRIVACY_POLICY.effectiveDate, 'October 20, 2026');
  assert.equal(CONSUMER_HEALTH_DATA_PRIVACY_POLICY.lastUpdated, 'October 20, 2026');
  assert.equal(CONSUMER_HEALTH_DATA_PRIVACY_POLICY.sections.length, 11);

  const sectionTitles = CONSUMER_HEALTH_DATA_PRIVACY_POLICY.sections.map((s) => s.title);
  assert.ok(sectionTitles.includes('Consumer Health Data We Collect'));
  assert.ok(sectionTitles.includes('Sources of Consumer Health Data'));
  assert.ok(sectionTitles.includes('Why We Collect and Use Consumer Health Data'));
  assert.ok(sectionTitles.includes('Consent for Collection and Disclosure'));
  assert.ok(sectionTitles.includes('Consumer Health Data We Disclose'));
  assert.ok(sectionTitles.includes('Your Consumer Health Data Rights'));
  assert.ok(sectionTitles.includes('How to Exercise Your Rights'));
  assert.ok(sectionTitles.includes('Contact'));
});

test('LEGAL_TERMS_VERSION is exported and matches 2026-10-20', () => {
  assert.equal(LEGAL_TERMS_VERSION, '2026-10-20');
});
