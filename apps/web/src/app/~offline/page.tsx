import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand-mark';
import { RetryButton } from './retry-button';

/**
 * Shown by the service worker when a page is opened with no network (#184).
 *
 * This page is precached, so it is stored on the phone. It must stay fully
 * static: no session, no baby, nothing about any mother. See docs/OFFLINE.md.
 */
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "You're offline · BumpToBloom",
};

export default function OfflinePage() {
  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-6 bg-[var(--page-surface)] px-6 text-center">
        <BrandMark tagline={false} />
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.25rem] font-semibold text-[var(--text-primary)]">
            You&apos;re offline
          </h1>
          <p className="max-w-[18rem] text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
            This page needs a connection. Try again once you&apos;re back
            online.
          </p>
        </div>
        <RetryButton />
      </main>
    </div>
  );
}
