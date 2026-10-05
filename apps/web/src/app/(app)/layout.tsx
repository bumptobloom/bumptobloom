import { requireUser } from '@/lib/auth/require-user';
import { AppShell } from '@/components/app-shell';
import { TimezoneSync } from '@/components/timezone-sync';
import { getParentTimezone } from '@/lib/api/parent-profile';

/**
 * Every screen inside this group is for a signed-in parent.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  const storedTimezone = await getParentTimezone();

  return (
    <>
      <TimezoneSync storedTimezone={storedTimezone} />
      <AppShell>{children}</AppShell>
    </>
  );
}
