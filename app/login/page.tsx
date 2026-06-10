'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login, user, token } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && token) {
      if (user.role === 'admin') window.location.href = '/admin';
      else if (user.role === 'agent') window.location.href = '/agent';
      else window.location.href = '/dashboard';
    }
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An error occurred during authentication.');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-800/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold text-yellow-400 tracking-tight">Nexoveda</span>
          <span className="text-xs uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-semibold">India</span>
        </Link>
        <Link href="/" className="text-sm text-emerald-400 hover:text-yellow-400 transition-colors">
          Back to Store
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-md bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-emerald-400 mt-2">
              {isRegister 
                ? 'Join Nexoveda India wellness community' 
                : 'Access your consultation dashboard & orders'}
            </p>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-6 flex gap-2 items-center">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@nexoveda.com"
                className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 active:scale-98 transition-all shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : isRegister ? 'Register Now' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-emerald-300 hover:text-yellow-400 transition-colors"
            >
              {isRegister 
                ? 'Already have an account? Sign In' 
                : "Don't have an account yet? Create one"}
            </button>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-emerald-950/40 text-center text-xs text-emerald-600">
        © 2026 Nexoveda India. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
