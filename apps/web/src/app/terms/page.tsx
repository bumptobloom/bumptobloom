import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { Callout } from '@/components/ui/callout';
import { TERMS_OF_USE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Use | BumpToBloom',
  description:
    "Review BumpToBloom's Terms of Use governing access to and use of our parenting guidance and developmental tracking platform.",
};

export default function TermsPage() {
  const { title, partTitle, effectiveDate, lastUpdated, preamble, sections, contactEmail, contactWebsite } =
    TERMS_OF_USE;

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
            <span
              aria-current="page"
              className="rounded-full bg-[var(--surface-moss)] px-3 py-1 font-semibold text-[var(--text-brand)] shadow-xs"
            >
              Terms of Use
            </span>
            <Link
              href="/privacy"
              className="rounded-full px-3 py-1 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        {/* Main Document Card */}
        <article className="mt-5 rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] p-6 shadow-xs">
          <header className="border-b border-[var(--border-subtle)] pb-5">
            <span className="type-eyebrow text-[var(--text-brand)] uppercase tracking-wide">
              {partTitle || 'Legal Terms'}
            </span>
            <h1 className="mt-1 text-[1.4rem] font-semibold text-[var(--text-primary)]" style={{ font: 'var(--type-card-title)' }}>
              {title}
            </h1>
            <p className="mt-2 text-[0.75rem] text-[var(--text-secondary)]">
              Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
            </p>

            <div className="mt-4 rounded-2xl bg-[var(--surface-terra)]/30 p-3.5 text-[0.82rem] leading-relaxed text-[var(--text-primary)]">
              {preamble.map((p, idx) => (
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
                  { label: '3. Educational Only', href: '#educational-information-only' },
                  { label: '4. Emergencies', href: '#emergencies' },
                  { label: '5. AI Info', href: '#ai-generated-information' },
                  { label: '6. Vitals Log', href: '#temperature-log' },
                  { label: '10. Acceptable Use', href: '#acceptable-use' },
                  { label: '14. Disclaimers', href: '#disclaimers' },
                  { label: '18. Contact', href: '#contact' },
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

          {/* Document Sections */}
          <div className="mt-6 space-y-6 text-[0.88rem] leading-[1.65] text-[var(--text-primary)]">
            {sections.map((section) => {
              const isEmergency = section.id === 'emergencies';
              const isEducational = section.id === 'educational-information-only';

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

                  {isEmergency && (
                    <div className="mt-3">
                      <Callout variant="safety" eyebrow="Emergency Notice">
                        If you believe you, your child, or another person may be in immediate danger, call{' '}
                        <strong>911</strong> in the United States or your local emergency number immediately.
                      </Callout>
                    </div>
                  )}

                  {isEducational && (
                    <div className="mt-3">
                      <Callout variant="caution" eyebrow="Educational Purpose Only">
                        BumpToBloom does not provide medical advice, diagnosis, treatment, clinical decision support,
                        or medical triage. Always consult a qualified healthcare professional.
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

                  {section.callout && (
                    <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--page-surface)] p-3 text-[0.78rem] font-mono leading-relaxed text-[var(--text-primary)]">
                      {section.callout.split('\n\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                          {line}
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

                  {section.id === 'contact' && (
                    <div className="mt-3 rounded-xl bg-[var(--surface-moss)] p-3.5 text-[0.82rem]">
                      <p className="text-[var(--text-primary)]">
                        <strong>Email:</strong>{' '}
                        <a
                          href={`mailto:${contactEmail}`}
                          className="font-medium text-[var(--text-brand)] underline underline-offset-2 hover:opacity-80"
                        >
                          {contactEmail}
                        </a>
                      </p>
                      <p className="mt-1 text-[var(--text-secondary)]">
                        <strong>Website:</strong> {contactWebsite}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Cross link to Part II */}
          <footer className="mt-8 rounded-2xl border border-[var(--border-card)] bg-[var(--surface-moss)]/40 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-5 shrink-0 text-[var(--text-brand)]" aria-hidden />
              <div>
                <h3 className="text-[0.92rem] font-semibold text-[var(--text-primary)]">
                  Consumer Health Data Privacy
                </h3>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--text-secondary)]">
                  Supplements these Terms with explicit disclosures on how child temperature logs and wellness entries are processed.
                </p>
                <Link
                  href="/privacy#health-data"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--text-brand)] underline underline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
                >
                  Read Consumer Health Data Privacy Policy
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </footer>
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