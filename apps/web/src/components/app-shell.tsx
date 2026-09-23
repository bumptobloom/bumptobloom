import type { ReactNode } from 'react';
import { AppHeader } from '@/components/app-header';
import { BottomTabBar } from '@/components/bottom-tab-bar';
import { OfflineGate } from '@/components/offline-gate';

/**
 * Phone-width column. On a laptop the app stays a phone-shaped column
 * centred on the canvas rather than stretching, because every screen in
 * this product is designed for one thumb.
 *
 * The header is PRD 2.1 and appears on all five tabs. Onboarding and the
 * signed-out screens use the centred brand lockup instead, not this.
 *
 * The bottom padding is the tab bar height (64px) plus breathing room, so
 * the tab bar never covers the last card and the page does not jump when
 * the content below it changes height.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)]">
        <AppHeader />
        <main className="flex-1 px-[var(--space-20)] pt-[var(--space-20)] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <OfflineGate>{children}</OfflineGate>
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
