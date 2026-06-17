// src/app/login/page.tsx (Full Fixed)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal masuk ke sistem.');
      }

      // Jika sukses, arahkan ke dashboard utama / Command Center
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-stone-200/60">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-stone-900">
            YoriPOS V3
          </h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Executive Command Center
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-stone-700">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                suppressHydrationWarning // Menghalangi error dari extension / autofill browser
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 disabled:opacity-50 text-sm"
                placeholder="ex: admin_asayori"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                suppressHydrationWarning // Menghalangi error dari extension / autofill browser
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 disabled:opacity-50 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning // Menghalangi error dari extension / autofill browser
              className="relative flex w-full justify-center rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:bg-stone-400 transition-colors"
            >
              {loading ? 'Memverifikasi...' : 'Masuk Command Center'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}