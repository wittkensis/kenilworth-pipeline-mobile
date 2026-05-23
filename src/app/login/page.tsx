'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/pipeline');
        router.refresh();
      } else {
        setError('Wrong password');
        setPassword('');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-folk-ink flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-folk-stone text-xs tracking-widest uppercase mb-8 text-center">
          Pipeline
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            autoFocus
            className="w-full px-4 py-4 rounded-xl bg-folk-charcoal border border-folk-stone/20 text-folk-cream placeholder-folk-stone/40 focus:outline-none focus:border-folk-stone/50 text-center tracking-widest"
          />

          {error && (
            <p className="text-red-400/80 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-4 rounded-xl bg-folk-cream text-folk-ink font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {loading ? '...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
