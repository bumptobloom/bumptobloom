'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import {
  PASSWORD_RULE_TEXT,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/validation/password';
import { resolveRecoveryState } from '@/lib/auth/recovery-state';

/**
 * PRD US-01, item 4: the second half of the reset flow.
 *
 * Forgot-password only ever sent the email. Its link pointed at /login, so a
 * mother clicking it landed on the log-in form with no way to choose a new
 * password and still could not get in. This is the screen the email promises.
 *
 * The link carries a recovery grant. Supabase's browser client picks it up on
 * load, which is what lets `updateUser` set a password without the old one.
 */
interface ResetPasswordAttemptProps {
  code: string | null;
  urlError: string | null;
}

function ResetPasswordAttempt({ code, urlError }: ResetPasswordAttemptProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [exchange, setExchange] = useState<'ok' | 'failed' | null>(null);
  const [sawRecoveryEvent, setSawRecoveryEvent] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const router = useRouter();
  const recoveryState = resolveRecoveryState({
    urlError,
    code,
    exchange,
    sawRecoveryEvent,
    timedOut,
  });

  useEffect(() => {
    if (urlError || !code) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const supabase = createBrowserClient();

    // PASSWORD_RECOVERY fires once the client has consumed the link. Subscribe
    // before exchanging, so a grant that lands a moment later is not missed.
    // A normal SIGNED_IN event or a cached session is not recovery proof.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') {
        if (timeoutId) clearTimeout(timeoutId);
        setSawRecoveryEvent(true);
      }
    });

    (async () => {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;

      if (!exchangeError) {
        setExchange('ok');
        return;
      }

      // detectSessionInUrl can win the race and consume the code first. In
      // that case our exchange fails, but PASSWORD_RECOVERY is still queued.
      // Give that event a short window before treating the link as invalid.
      setExchange('failed');
      timeoutId = setTimeout(() => {
        if (!cancelled) setTimedOut(true);
      }, 2_000);
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, [code, urlError]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (recoveryState !== 'verified') {
      setError('This reset link has expired or has already been used.');
      return;
    }

    const matchError = validatePasswordConfirmation(password, confirmPassword);
    if (matchError) {
      setError(matchError);
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || 'Could not update your password.');
      setLoading(false);
      return;
    }

    // The recovery link signs her in. Ending that session means the link
    // cannot keep granting access after it has done its job, and it matches
    // what US-01 describes: she resets, then logs in.
    await supabase.auth.signOut();
    setDone(true);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/login"
          aria-label="Back to log in"
          className="flex size-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-[1.15rem] text-[var(--text-primary)]">
          Choose a new password
        </h1>
      </div>

      {done ? (
        <div className="space-y-4">
          <p className="rounded-[var(--radius-input)] bg-[var(--surface-moss)] px-3 py-3 text-[0.82rem] leading-[1.5] text-[var(--text-brand)]">
            Your password has been updated. You can log in with it now.
          </p>
          <Link
            href="/login"
            className="block text-center text-[0.82rem] text-[var(--text-primary)] underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        </div>
      ) : recoveryState === 'invalid' ? (
        <div className="space-y-4">
          <p
            role="alert"
            className="rounded-[var(--radius-input)] bg-[var(--surface-terra)] px-3 py-3 text-[0.82rem] leading-[1.5] text-[var(--text-accent-terracotta)]"
          >
            This reset link has expired or has already been used. Reset links
            last 15 minutes and work once.
          </p>
          <Link
            href="/forgot-password"
            className="block text-center text-[0.82rem] text-[var(--text-primary)] underline-offset-4 hover:underline"
          >
            Send a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-3">
          <p className="text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
            Choose a new password for your account.
          </p>

          {error ? (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] bg-[var(--surface-terra)] px-3 py-2.5 text-[0.8rem] text-[var(--text-accent-terracotta)]"
            >
              {error}
            </div>
          ) : null}

          <TextField
            revealable
            required
            autoComplete="new-password"
            placeholder="New password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="px-1 text-[0.72rem] text-[var(--text-secondary)]">
            {PASSWORD_RULE_TEXT}
          </p>

          <TextField
            revealable
            required
            autoComplete="new-password"
            placeholder="Confirm new password"
            icon={<Lock className="size-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading || recoveryState === 'pending'}
            className="h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
          >
            {loading
              ? 'Updating…'
              : recoveryState === 'pending'
                ? 'Checking your link…'
                : 'Update password'}
          </Button>
        </form>
      )}
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  // An expired or already-used link comes back with an error on the URL rather
  // than a recovery code (US-01: single use, 15 minutes). Keying the attempt
  // also clears its state if a different link opens without remounting the page.
  const urlError =
    searchParams.get('error_description') ?? searchParams.get('error');
  const code = searchParams.get('code');
  const attemptKey = `${urlError ?? ''}:${code ?? ''}`;

  return (
    <ResetPasswordAttempt
      key={attemptKey}
      code={code}
      urlError={urlError}
    />
  );
}

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
