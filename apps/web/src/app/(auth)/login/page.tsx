'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

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

    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log In</h1>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
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
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </div>
        
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
        <Link href="/signup" className="text-blue-600 hover:underline">Create account</Link>
      </div>
    </div>
  );
}