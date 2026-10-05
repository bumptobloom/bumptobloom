'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setParentTimezone } from '@/lib/actions/parent-profile';

/**
 * Keeps parent_profiles.timezone equal to the zone the parent is actually in.
 *
 * Nothing ever wrote that column, so it was null on every real account and
 * Vitals fell back to UTC for both the day query and the clock on each
 * reading. This is the one place the device zone is read; every screen still
 * formats from the stored profile zone, so the query and the display cannot
 * drift apart (Keya's decision, 1 Oct).
 *
 * Mounted in the (app) layout rather than on Vitals so the profile is already
 * correct by the time she opens Vitals from any other tab. It writes only when
 * the device disagrees with what is stored, which means one write when an
 * account first signs in and one more if she travels, not one per navigation.
 *
 * refresh() is needed because the zone arrives after the server render that
 * used the old one. On a brand new account whose very first screen is Vitals,
 * that shows UTC for one frame before repainting in her own zone. Writing the
 * zone at signup as well would remove that frame, at the cost of putting this
 * in the auth flow; not worth it for a single repaint that happens once.
 */
export function TimezoneSync({ storedTimezone }: { storedTimezone: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!deviceTimezone || deviceTimezone === storedTimezone) {
      return;
    }

    let cancelled = false;

    setParentTimezone(deviceTimezone).then((result) => {
      if (!cancelled && result.success) {
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [storedTimezone, router]);

  return null;
}
