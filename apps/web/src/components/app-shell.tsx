import type { ReactNode } from 'react';
import { BottomTabBar } from '@/components/bottom-tab-bar';

/**
 * Phone-width column. On a laptop the app stays a phone-shaped column
 * centred on the canvas rather than stretching, because every screen in
 * this product is designed for one thumb.
 *
 * The bottom padding is the tab bar height (64px) plus breathing room, so
 * the tab bar never covers the last card and the page does not jump when
 * the content below it changes height.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-[var(--canvas)]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--page-surface)]">
        <main className="flex-1 px-5 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
