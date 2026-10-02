import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';

export default function TermsPage() {
  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)] px-6 pt-12 pb-10">
        <BrandMark tagline={false} />
        <div className="mt-7 rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-6">
          <div className="mb-4 flex items-center gap-3">
            <Link
              href="/signup"
              aria-label="Back to sign up"
              className="flex size-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-brand)]"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <h1 className="text-[1.15rem] text-[var(--text-primary)]">Terms of Service</h1>
          </div>
          <p className="text-[0.85rem] leading-[1.6] text-[var(--text-secondary)]">
            BumpToBloom provides developmental milestone tracking, guidance, and educational information. Full terms of service will be published prior to public release.
          </p>
        </div>
      </div>
    </div>
  );
}