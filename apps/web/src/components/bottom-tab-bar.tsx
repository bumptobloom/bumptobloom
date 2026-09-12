'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Nav order settled by Product (Katrina) on 1 Sep: Home, Learn, Ask, Track, Health.
 * Five tabs, not six. Cart is not a tab - shopping is a card on Home.
 * The Figma still shows the old six-tab order. This list is the source of truth.
 */
const TABS = [
  { href: '/home', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/ask', label: 'Ask' },
  { href: '/track', label: 'Track' },
  { href: '/health', label: 'Health' },
] as const;

function TabIcon({ href, active }: { href: string; active: boolean }) {
  const stroke = active ? 'var(--text-brand)' : 'var(--text-secondary)';
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: active ? 2.2 : 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (href) {
    case '/home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        </svg>
      );
    case '/learn':
      return (
        <svg {...common}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
          <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />
        </svg>
      );
    case '/ask':
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-3.2-6.4" />
          <path d="M21 4v5h-5" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case '/track':
      return (
        <svg {...common}>
          <path d="M9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="m8.5 13 2 2 4-4.5" />
        </svg>
      );
    case '/health':
      return (
        <svg {...common}>
          <path d="M12 21c-1 0-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 3.5C19 16.5 13 21 12 21Z" />
        </svg>
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
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                  active ? 'font-semibold' : 'font-normal'
                )}
                style={{ color: active ? 'var(--text-brand)' : 'var(--text-secondary)' }}
              >
                <TabIcon href={tab.href} active={active} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
