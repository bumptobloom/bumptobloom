import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

/**
 * Server-side auth guard. Redirects to /login when there is no session.
 *
 * Every signed-in route calls this. The middleware refreshes the session but
 * does not guard anything, so this is the only thing standing between an
 * anonymous visitor and a screen that assumes a parent.
 *
 * It lives here rather than inline in a layout so that a route added outside
 * the (app) group cannot quietly skip it, which is exactly how /onboarding
 * ended up unprotected.
 */
export async function requireUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
