'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { createParentProfile } from '@/lib/actions/parent-profile';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    // Self-heal: if signup succeeded creating the auth account but the
    // parent_profiles insert failed (see #205), this recovers the account
    // transparently on next login instead of leaving the user stuck.
    // No-op if the profile already exists.
    await createParentProfile();

    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-6">
        <p className="mb-5 text-center text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
          Welcome back &mdash; let&apos;s pick up where you left off.
        </p>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-[var(--radius-input)] bg-[var(--surface-terra)] px-3 py-2.5 text-[0.8rem] text-[var(--text-accent-terracotta)]"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-3">
          <TextField
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            revealable
            required
            autoComplete="current-password"
            placeholder="Password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[0.78rem] text-[var(--text-secondary)] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="text-[0.7rem] text-[var(--brand-primary)]">&#10022;</span>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <p className="mt-3 text-center text-[0.72rem] text-[var(--text-secondary)]">
          Your information stays private and secure.
        </p>
      </div>

      <p className="text-center text-[0.82rem] text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-[var(--text-primary)] underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
