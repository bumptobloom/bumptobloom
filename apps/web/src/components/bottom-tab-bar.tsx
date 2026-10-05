'use client';

import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Five tabs: Home, Learn, Ask, Track, Vitals. Cart is not a tab — the
 * Recommended for You surface is reached from a card on Home (PRD 2.2).
 *
 * The fifth tab is Vitals, not Health. PRD 2.2 and 2.7 both name it Vitals and
 * so does the Figma's Final Screens page. An earlier note here said the Figma
 * still showed six tabs in the old order; that was the pre-redesign file, and
 * it is no longer true of the file the PRD links as final.
 */
const TABS = [
  { href: '/home', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/ask', label: 'Ask' },
  { href: '/track', label: 'Track' },
  { href: '/vitals', label: 'Vitals' },
] as const;

function TabIcon({ href }: { href: string }) {
  const iconBox = 'flex size-6 items-center justify-center leading-none';
  const lucideClass = 'size-6';

  switch (href) {
    case '/home':
      return (
        <span className={`${iconBox} text-[1.25rem]`} aria-hidden>
          🏠
        </span>
      );

    case '/learn':
      return (
        <span className={`${iconBox} text-[1.3rem]`} aria-hidden>
          📖
        </span>
      );

    case '/ask':
      return (
        <span className={iconBox}>
          <MessageCircle className={lucideClass} aria-hidden />
        </span>
      );

    case '/track':
      return (
        <span className={`${iconBox} text-[1.25rem]`} aria-hidden>
          🌱
        </span>
      );

    case '/vitals':
      return (
        <span className={iconBox}>
          <Heart className={lucideClass} aria-hidden />
        </span>
      );

    default:
      return null;
  }
}

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-[var(--border-subtle)] bg-[var(--card-primary)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition-colors',
                  active
                    ? 'bg-[var(--surface-moss)] font-semibold'
                    : 'font-normal',
                )}
                style={{ color: active ? 'var(--text-brand)' : 'var(--text-secondary)' }}
              >
                <TabIcon href={tab.href} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
