import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, HeartPulse, Lock, Clock, ExternalLink } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { Callout } from '@/components/ui/callout';
import { PRIVACY_POLICY, CONSUMER_HEALTH_DATA_PRIVACY_POLICY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy & Consumer Health Data | BumpToBloom',
  description:
    "Learn how BumpToBloom protects your family's data, our 30-day active deletion policy, and our Consumer Health Data Privacy Policy.",
};

export default function PrivacyPage() {
  const privacy = PRIVACY_POLICY;
  const healthPrivacy = CONSUMER_HEALTH_DATA_PRIVACY_POLICY;

  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-5 pt-8 pb-12">
        {/* Brand header */}
        <header className="flex flex-col items-center">
          <BrandMark tagline={false} />
        </header>

        {/* Navigation bar with Back link & document switcher */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            href="/signup"
            aria-label="Back to sign up"
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>

          <nav aria-label="Legal documents" className="flex rounded-full border border-[var(--border-card)] bg-[var(--card-primary)] p-1 text-[0.8rem]">
            <Link
              href="/terms"
              className="rounded-full px-3 py-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
            >
              Terms of Use
            </Link>
            <span
              aria-current="page"
              className="rounded-full bg-[var(--surface-moss)] px-3 py-1 font-semibold text-[var(--text-brand)] shadow-xs"
            >
              Privacy Policy
            </span>
          </nav>
        </div>

        {/* Part I: Main Privacy Policy Card */}
        <article className="mt-5 rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] p-6 shadow-xs">
          <header className="border-b border-[var(--border-subtle)] pb-5">
            <span className="type-eyebrow text-[var(--text-brand)] uppercase tracking-wide">
              Privacy &amp; Data Protection
            </span>
            <h1 className="mt-1 text-[1.4rem] font-semibold text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
              {privacy.title}
            </h1>
            <p className="mt-2 text-[0.75rem] text-[var(--text-secondary)]">
              Effective Date: {privacy.effectiveDate} | Last Updated: {privacy.lastUpdated}
            </p>

            <div className="mt-4 rounded-2xl bg-[var(--surface-moss)]/40 p-3.5 text-[0.82rem] leading-relaxed text-[var(--text-primary)]">
              {privacy.preamble.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Quick jump navigation */}
            <div className="mt-4">
              <p className="text-[0.72rem] font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                Jump to key section
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { label: '1. What We Collect', href: '#information-we-collect' },
                  { label: '2. How We Use', href: '#how-we-use-information' },
                  { label: '3. AI & Ask', href: '#ai-and-ask-conversations' },
                  { label: '8. Retention & Deletion', href: '#data-retention-and-deletion' },
                  { label: '10. Privacy Rights', href: '#privacy-choices-and-rights' },
                  { label: '12. HIPAA Notice', href: '#hipaa' },
                  { label: 'Part II: Health Privacy', href: '#health-data' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--page-surface)] px-2 py-1 text-[0.72rem] text-[var(--text-secondary)] transition hover:border-[var(--text-brand)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </header>

          {/* Privacy Policy Sections */}
          <div className="mt-6 space-y-6 text-[0.88rem] leading-[1.65] text-[var(--text-primary)]">
            {privacy.sections.map((section) => {
              const isRetention = section.id === 'data-retention-and-deletion';
              const isHipaa = section.id === 'hipaa';

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-4 border-b border-[var(--border-subtle)]/60 pb-5 last:border-b-0 last:pb-0"
                >
                  <h2 className="flex items-baseline gap-2 text-[1.05rem] font-semibold text-[var(--text-primary)]">
                    <span className="text-[var(--text-brand)]">{section.number}.</span>
                    <span>{section.title}</span>
                  </h2>

                  {isRetention && (
                    <div className="mt-3">
                      <Callout variant="info" eyebrow="Data Retention Policy">
                        Active data deleted within <strong>30 days</strong> of request. Encrypted backup copies
                        overwritten within <strong>90 days</strong> in the normal course of business.
                      </Callout>
                    </div>
                  )}

                  {isHipaa && (
                    <div className="mt-3">
                      <Callout variant="caution" eyebrow="HIPAA Clarification">
                        BumpToBloom is a consumer parenting app, not a healthcare provider or covered entity. Data
                        submitted directly is not protected health information under HIPAA.
                      </Callout>
                    </div>
                  )}

                  {section.content && (
                    <p className="mt-2 text-[var(--text-secondary)]">{section.content}</p>
                  )}

                  {section.paragraphs && (
                    <div className="mt-2 space-y-2.5">
                      {section.paragraphs.map((para, idx) => (
                        <p key={idx} className="text-[var(--text-secondary)]">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Subsections (like in Section 1) */}
                  {section.subsections && (
                    <div className="mt-3 space-y-4">
                      {section.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="rounded-xl border border-[var(--border-subtle)]/70 bg-[var(--page-surface)]/60 p-3.5">
                          {sub.title && (
                            <h3 className="text-[0.85rem] font-semibold text-[var(--text-primary)]">
                              {sub.title}
                            </h3>
                          )}
                          {sub.items && (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-[0.82rem] text-[var(--text-secondary)]">
                              {sub.items.map((item, iIdx) => (
                                <li key={iIdx}>{item}</li>
                              ))}
                            </ul>
                          )}
                          {sub.description && (
                            <p className="mt-2 text-[0.8rem] italic text-[var(--text-secondary)]">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.listItems && (
                    <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[var(--text-secondary)]">
                      {section.listItems.map((item, idx) => (
                        <li key={idx} className="pl-0.5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.id === 'contact-us' && (
                    <div className="mt-3 rounded-xl bg-[var(--surface-moss)] p-3.5 text-[0.82rem]">
                      <p className="text-[var(--text-primary)]">
                        <strong>Email:</strong>{' '}
                        <a
                          href={`mailto:${privacy.contactEmail}`}
                          className="font-medium text-[var(--text-brand)] underline underline-offset-2 hover:opacity-80"
                        >
                          {privacy.contactEmail}
                        </a>
                      </p>
                      <p className="mt-1 text-[var(--text-secondary)]">
                        <strong>Website:</strong> {privacy.contactWebsite}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </article>

        {/* Part II: Consumer Health Data Privacy Policy Card */}
        <article
          id="health-data"
          className="mt-6 scroll-mt-6 rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] p-6 shadow-xs"
        >
          <header className="border-b border-[var(--border-subtle)] pb-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-5 text-[var(--text-alert)]" aria-hidden />
              <span className="type-eyebrow text-[var(--text-alert)] uppercase tracking-wide">
                {healthPrivacy.partTitle || 'Part II'}
              </span>
            </div>
            <h2 className="mt-1 text-[1.3rem] font-semibold text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
              {healthPrivacy.title}
            </h2>
            <p className="mt-2 text-[0.75rem] text-[var(--text-secondary)]">
              Effective Date: {healthPrivacy.effectiveDate} | Last Updated: {healthPrivacy.lastUpdated}
            </p>

            <div className="mt-4 rounded-2xl bg-[var(--surface-terra)]/40 p-3.5 text-[0.82rem] leading-relaxed text-[var(--text-primary)]">
              {healthPrivacy.preamble.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </header>

          {/* Consumer Health Data Sections */}
          <div className="mt-6 space-y-6 text-[0.88rem] leading-[1.65] text-[var(--text-primary)]">
            {healthPrivacy.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-4 border-b border-[var(--border-subtle)]/60 pb-5 last:border-b-0 last:pb-0"
              >
                <h3 className="flex items-baseline gap-2 text-[1rem] font-semibold text-[var(--text-primary)]">
                  <span className="text-[var(--text-brand)]">{section.number}.</span>
                  <span>{section.title}</span>
                </h3>

                {section.content && (
                  <p className="mt-2 text-[var(--text-secondary)]">{section.content}</p>
                )}

                {section.paragraphs && (
                  <div className="mt-2 space-y-2.5">
                    {section.paragraphs.map((para, idx) => (
                      <p key={idx} className="text-[var(--text-secondary)]">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {section.listItems && (
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[var(--text-secondary)]">
                    {section.listItems.map((item, idx) => (
                      <li key={idx} className="pl-0.5">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.callout && (
                  <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--page-surface)] p-3 text-[0.8rem] leading-relaxed text-[var(--text-secondary)]">
                    {section.callout}
                  </div>
                )}

                {section.id === 'health-policy-contact' && (
                  <div className="mt-3 rounded-xl bg-[var(--surface-moss)] p-3.5 text-[0.82rem]">
                    <p className="text-[var(--text-primary)]">
                      <strong>Email:</strong>{' '}
                      <a
                        href={`mailto:${healthPrivacy.contactEmail}`}
                        className="font-medium text-[var(--text-brand)] underline underline-offset-2 hover:opacity-80"
                      >
                        {healthPrivacy.contactEmail}
                      </a>
                    </p>
                    <p className="mt-1 text-[var(--text-secondary)]">
                      <strong>Website:</strong> {healthPrivacy.contactWebsite}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>

        {/* Back to top & bottom return link */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <Link
            href="/signup"
            className="text-[0.82rem] font-medium text-[var(--text-brand)] underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
          >
            &larr; Return to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}