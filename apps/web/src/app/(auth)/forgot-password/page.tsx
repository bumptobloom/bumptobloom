'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    // Must point at /reset-password, not /login. It used to send her to the
    // log-in form, where there was nothing to do with the recovery link and no
    // way to choose a new password (PRD US-01, item 4).
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message || 'Failed to send reset link.');
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
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
        <h1 className="text-[1.15rem] text-[var(--text-primary)]">Reset password</h1>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <p className="rounded-[var(--radius-input)] bg-[var(--surface-moss)] px-3 py-3 text-[0.82rem] leading-[1.5] text-[var(--text-brand)]">
            If an account exists for {email}, a password reset link is on its way.
            The link can be used once and expires after 15 minutes.
          </p>
          <Link
            href="/login"
            className="block text-center text-[0.82rem] text-[var(--text-primary)] underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-3">
          <p className="text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
            Enter the email you signed up with and we&apos;ll send you a link to
            choose a new password.
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
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </div>
  );
}
