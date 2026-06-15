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
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already logged in
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
        window.location.href = '/dashboard';
      }
    }
  }, [user, token]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();
    const purpose = isRegister ? 'register' : 'forgot_password';

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();

    try {
      if (isRegister) {
        // Register Account
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: targetEmail, password, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed.');
        login(data.token, data.user);
      } else if (isForgotPassword) {
        // Reset Password
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, newPassword: password, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Password reset failed.');
        
        // Reset success, go back to login
        setIsForgotPassword(false);
        setOtpSent(false);
        setOtp('');
        setPassword('');
        setError('Password reset successfully! Please sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();
    const staffEmails = ['admin@nexoveda.com', 'harsh@nexoveda.com', 'anamika@nexoveda.com', 'smita@nexoveda.com'];
    if (staffEmails.includes(targetEmail)) {
      setError('Invalid email or password.');
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
        throw new Error(data.message || 'An error occurred during authentication.');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode: 'login' | 'register' | 'forgot') => {
    setIsRegister(mode === 'register');
    setIsForgotPassword(mode === 'forgot');
    setOtpSent(false);
    setError('');
    setOtp('');
  };

  let title = 'Welcome Back';
  let subtitle = 'Access your consultation dashboard & orders';
  if (isRegister) {
    title = 'Create Account';
    subtitle = 'Join Nexoveda Global wellness community';
  } else if (isForgotPassword) {
    title = 'Reset Password';
    subtitle = 'Enter your email to receive a secure OTP';
  }

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-800/10 rounded-full blur-[130px] pointer-events-none"></div>

      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold text-yellow-400 tracking-tight">Nexoveda</span>
        </Link>
        <Link href="/" className="text-sm text-emerald-400 hover:text-yellow-400 transition-colors">
          Back to Store
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-md bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-sm text-emerald-400 mt-2">{subtitle}</p>
          </div>

          {error && (
            <div className={`border px-4 py-3 rounded-xl text-sm mb-6 flex gap-2 items-center ${
              error.includes('successfully') ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200' : 'bg-red-950/30 border-red-900/50 text-red-200'
            }`}>
              <span className="text-lg">{error.includes('successfully') ? '✅' : '⚠️'}</span>
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={!isRegister && !isForgotPassword ? handleLogin : handleSendOtp} className="space-y-5">
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

              {!isForgotPassword && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Password
                    </label>
                    {!isRegister && (
                      <button type="button" onClick={() => toggleMode('forgot')} className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 active:scale-98 transition-all shadow-lg shadow-yellow-500/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing...' : (!isRegister && !isForgotPassword ? 'Sign In' : (isRegister ? 'Send OTP for Verification' : 'Send Reset OTP'))}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-bold text-lg focus:border-yellow-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-emerald-500 mt-2 text-center">We've sent a code to {email}</p>
              </div>

              {isForgotPassword && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-500 active:scale-98 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : (isRegister ? 'Verify & Create Account' : 'Reset Password')}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => toggleMode(isRegister || isForgotPassword ? 'login' : 'register')}
              className="text-xs text-emerald-300 hover:text-yellow-400 transition-colors"
            >
              {isRegister || isForgotPassword
                ? 'Back to Sign In' 
                : "Don't have an account yet? Create one"}
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-emerald-950/40 text-center text-xs text-emerald-600">
        © 2026 Nexoveda Global. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
