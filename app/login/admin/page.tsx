'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { login, user, token } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && token) {
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        setError('Your current session is not an Administrator. Please log in with admin credentials.');
      }
    }
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();
    if (targetEmail !== 'admin@nexoveda.com') {
      setError('This portal is restricted exclusively for Nexoveda Admin.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Authenticated user is not an administrator.');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030906] text-gray-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-tight">Nexoveda</span>
        </Link>
        <Link href="/" className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-yellow-400 transition-colors">
          Back to Store
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-md bg-emerald-950/10 border border-emerald-900/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Admin Control Desk
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mt-2">
              Secure Staff Authentication Portal
            </p>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-200 p-4 rounded-xl text-xs mb-6 flex gap-2.5 items-center">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexoveda.com"
                className="w-full bg-[#030907] border border-emerald-900/50 rounded-xl px-4.5 py-3.5 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
                Access Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#030907] border border-emerald-900/50 rounded-xl px-4.5 py-3.5 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-4 rounded-xl hover:from-yellow-400 hover:to-amber-400 active:scale-98 transition-all shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-emerald-900/10">
            <Link href="/login" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">
              Are you a Customer? Sign In here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-emerald-950/40 text-center text-xs text-gray-600">
        © 2026 Nexoveda Global. Admin Console. Secure Server Environment.
      </footer>
    </div>
  );
}
