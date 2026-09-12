'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { createParentProfile } from './actions';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[0.78rem] text-[var(--text-primary)]">
      {children}
    </span>
  );
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return 'Password must contain at least one letter and one number.';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError('You must accept the Terms and Privacy policy to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || 'Failed to create account.');
      setLoading(false);
      return;
    }

    if (data.user) {
      const result = await createParentProfile(data.user.id, fullName);
      if (!result.success) {
        setError("We couldn't finish setting up your account. Please try again or contact support.");
        setLoading(false);
        return;
      }

      // PRD US-02: account creation proceeds to the journey selection screen,
      // not to Home. Sending her to '/' lands on Home with no baby, which has
      // no screen in the Figma.
      router.push('/onboarding');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-6">
        <div className="mb-1 flex items-center gap-3">
          <Link
            href="/login"
            aria-label="Back to log in"
            className="flex size-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-[1.15rem] text-[var(--text-primary)]">Create Account</h1>
        </div>

        <p className="mb-5 text-center text-[0.82rem] leading-[1.5] text-[var(--text-secondary)]">
          Join BumpToBloom and start your personalized journey.
        </p>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-[var(--radius-input)] bg-[var(--surface-terra)] px-3 py-2.5 text-[0.8rem] text-[var(--text-accent-terracotta)]"
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSignup} className="space-y-3.5">
          <label className="block">
            <FieldLabel>Full name</FieldLabel>
            <TextField
              type="text"
              required
              autoComplete="name"
              placeholder="Enter your full name"
              icon={<User className="size-4" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="block">
            <FieldLabel>Email</FieldLabel>
            <TextField
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email address"
              icon={<Mail className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <FieldLabel>Password</FieldLabel>
            <TextField
              revealable
              required
              autoComplete="new-password"
              placeholder="Create a password"
              icon={<Lock className="size-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="mt-1.5 block text-[0.72rem] text-[var(--text-secondary)]">
              At least 8 characters with a letter and a number.
            </span>
          </label>

          <label className="block">
            <FieldLabel>Confirm password</FieldLabel>
            <TextField
              revealable
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              icon={<Lock className="size-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <label className="flex items-start gap-2.5 pt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-[var(--border-subtle)] accent-[var(--brand-secondary)]"
            />
            <span className="text-[0.78rem] leading-[1.45] text-[var(--text-secondary)]">
              I agree to the{' '}
              <Link href="/terms" className="text-[var(--text-accent-warm)] underline underline-offset-2">
                Terms
              </Link>{' '}
              &amp;{' '}
              <Link href="/privacy" className="text-[var(--text-accent-warm)] underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="text-[0.72rem] text-[var(--text-secondary)]">or</span>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        {/* PRD US-02: display the Google CTA but disable it for MVP. */}
        <button
          type="button"
          disabled
          aria-disabled
          title="Google sign-in is not available in the MVP"
          className="mt-3 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius-button-primary)] border border-[var(--border-subtle)] bg-white/70 text-[0.9rem] text-[var(--text-secondary)] opacity-60"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
            <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.6 14.7a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
            <path fill="#EA4335" d="M12 4.7c1.7 0 3.2.6 4.4 1.7l3.3-3.2A11.5 11.5 0 0 0 1.8 7.3l3.8 3c.9-2.7 3.4-4.6 6.4-4.6Z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="text-center text-[0.82rem] text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--text-primary)] underline-offset-4 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
