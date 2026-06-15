'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const { login, user, token } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as staff
  useEffect(() => {
    if (user && token) {
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else if (user.role === 'agent') {
        if (user.email === 'harsh@nexoveda.com') {
          window.location.href = '/agent/harsh';
        } else if (user.email === 'anamika@nexoveda.com') {
          window.location.href = '/agent/anamika';
        } else if (user.email === 'smita@nexoveda.com') {
          window.location.href = '/agent/smita';
        } else {
          window.location.href = '/agent';
        }
      } else {
        setError('This portal is reserved for staff members only. Your current session is a Customer account.');
      }
    }
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();
    const allowedStaff = ['admin@nexoveda.com', 'harsh@nexoveda.com', 'anamika@nexoveda.com', 'smita@nexoveda.com'];

    if (!allowedStaff.includes(targetEmail)) {
      setError('This portal is reserved for authorized Nexoveda staff only.');
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

      if (data.user.role !== 'admin' && data.user.role !== 'agent') {
        throw new Error('Authenticated account does not have staff permissions.');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b08] text-gray-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      
      {/* Background glow filters */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#07130f]/60 border border-emerald-900/30 rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>

        {/* Lock/Security Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-3xl shadow-inner shadow-black/50">
            🔐
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            Nexoveda Staff Portal
          </h2>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mt-2">
            Secure Internal Access Only
          </p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-900/40 text-red-200 p-4 rounded-xl text-xs mb-6 flex gap-2.5 items-center">
            <span className="text-base">⚠️</span>
            <span className="font-semibold leading-normal">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-2">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@nexoveda.com"
              className="w-full bg-[#030705] border border-emerald-900/50 rounded-xl px-4.5 py-4 text-xs focus:border-yellow-400 focus:outline-none transition-colors text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-2">
              Access Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#030705] border border-emerald-900/50 rounded-xl px-4.5 py-4 text-xs focus:border-yellow-400 focus:outline-none transition-colors text-white font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black py-4.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-xs uppercase tracking-widest"
          >
            {loading ? 'Authenticating...' : 'Sign In as Staff'}
          </button>
        </form>

      </div>

      <div className="mt-8 text-center text-[10px] text-gray-600 font-semibold tracking-wider uppercase">
        © 2026 Nexoveda Wellness Global. Authorized Personnel Only.
      </div>

    </div>
  );
}
