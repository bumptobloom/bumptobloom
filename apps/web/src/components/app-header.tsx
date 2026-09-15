'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, CreditCard, LogOut } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { BloomB } from '@/components/brand-mark';

/**
 * The header that PRD 2.1 puts on Home, Learn, Ask, Track and Vitals: the mark
 * and the product name on the left, settings on the right.
 *
 * The menu carries the three items the PRD names. Notifications and Payment are
 * disabled rather than hidden, because the PRD asks for them to be visible and
 * greyed for the MVP. Log out is the only one that does anything.
 */
function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await createBrowserClient().auth.signOut();
      router.push('/login');
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Settings"
        className="flex size-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-primary)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        <Settings className="size-[18px]" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Settings"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-[var(--radius-input)] border border-[var(--border-card)] bg-[var(--card-primary)] shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled
            aria-disabled
            title="Not available in the MVP"
            className="flex w-full cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.85rem] text-[var(--text-secondary)] opacity-50"
          >
            <Bell className="size-4" />
            Notifications
          </button>

          <button
            type="button"
            role="menuitem"
            disabled
            aria-disabled
            title="Not available in the MVP"
            className="flex w-full cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.85rem] text-[var(--text-secondary)] opacity-50"
          >
            <CreditCard className="size-4" />
            Payment
          </button>

          <div className="h-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={busy}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.85rem] text-[var(--text-primary)] transition hover:bg-[var(--surface-terra)]/40 disabled:opacity-60"
          >
            <LogOut className="size-4" />
            {busy ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-1">
      <div className="flex items-baseline gap-1.5">
        <BloomB className="text-[1.3rem]" />
        <span className="text-[1.05rem] leading-none text-[var(--text-primary)]">
          BumpToBloom
        </span>
      </div>
      <SettingsMenu />
    </header>
  );
}
