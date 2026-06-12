'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, useCart, useChat } from '../providers';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { setChatOpen, setChatTab } = useChat();
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#050e0a]/80 border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-yellow-400 tracking-tight">Nexoveda</span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-100/80">
            <Link href="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-yellow-400 transition-colors">Shop Catalog</Link>
            <button onClick={() => { setChatTab('chat'); setChatOpen(true); }} className="hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer">Talk to Health Consultant</button>
            <Link href="/dashboard" className="hover:text-yellow-400 transition-colors">My Dashboard</Link>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            
            {/* Cart Link */}
            <Link href="/cart" className="relative p-2 text-emerald-300 hover:text-yellow-400 transition-colors bg-emerald-950/20 rounded-xl border border-emerald-900/30">
              <span className="text-lg">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#050e0a]">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                  <p className="text-xs font-bold text-emerald-300">
                    {user.name.split(' ')[0]} 
                    {user.loyaltyPoints !== undefined && (
                      <span className="text-yellow-400 ml-1">({user.loyaltyPoints.toFixed(2)} pts)</span>
                    )}
                  </p>
                </div>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="bg-emerald-950/80 border border-emerald-800 hover:border-yellow-400/50 hover:bg-emerald-900 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  >
                    Admin Console
                  </Link>
                )}

                {user.role === 'agent' && (
                  <Link 
                    href="/agent" 
                    className="bg-emerald-950/80 border border-emerald-800 hover:border-yellow-400/50 hover:bg-emerald-900 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  >
                    Advisor Desk
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-emerald-950 hover:bg-red-950/40 hover:text-red-300 text-gray-300 border border-emerald-900/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-yellow-500/10 hover:shadow-yellow-400/20 active:scale-95 transition-all"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}
