import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { AppShell } from '@/components/app-shell';

/**
 * Every screen inside this group is for a signed-in parent. The auth check
 * lives here once rather than in each page, so a new tab cannot be added
 * without it.
 *
 * The middleware refreshes the session but does not guard routes, so this
 * is the guard.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
