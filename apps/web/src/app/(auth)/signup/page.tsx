'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const { error: profileError } = await supabase
        .from('parent_profiles')
        .insert([
          {
            user_id: data.user.id,
            full_name: fullName,
          },
        ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      router.push('/');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create Account</h1>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 pr-10 rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm Password</label>
          <div className="relative mt-1">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 pr-10 rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the <Link href="/terms" className="text-blue-600 underline">Terms</Link> and{' '}
            <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>
          </label>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <p className="text-sm">
        Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}