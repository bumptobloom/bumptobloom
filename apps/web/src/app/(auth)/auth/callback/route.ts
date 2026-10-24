import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createParentProfile } from '@/lib/actions/parent-profile';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next');
  const next =
    requestedNext && requestedNext.startsWith('/')
      ? requestedNext
      : '/onboarding';

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=google_signin_failed', url.origin),
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=google_signin_failed', url.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Parent';

    await createParentProfile(fullName);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}