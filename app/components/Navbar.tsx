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
    const isStaff = user && (user.role === 'agent' || user.role === 'admin');
    logout();
    if (isStaff) {
      window.location.href = '/staff';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#030906]/70 border-b border-emerald-950/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-22">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🌿</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-tight">Nexoveda</span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-emerald-100/75">
            <Link href="/" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">Home</Link>
            <Link href="/shop" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">Shop Catalog</Link>
            <button 
              onClick={() => { setChatTab('chat'); setChatOpen(true); }} 
              className="hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer text-xs font-black uppercase tracking-wider text-emerald-100/75 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300"
            >
              Talk to Health Consultant
            </button>
            <Link href="/dashboard" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">My Dashboard</Link>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-5">
            
            {/* Cart Link */}
            <Link href="/cart" className="relative p-3 text-emerald-300 hover:text-yellow-400 transition-all bg-emerald-950/15 rounded-2xl border border-emerald-900/15 hover:border-yellow-400/40">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border border-[#030906]">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right">
                  <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">Logged In</p>
                  <p className="text-xs font-black text-emerald-300 mt-0.5">
                    {user.name.split(' ')[0]} 
                    {user.loyaltyPoints !== undefined && (
                      <span className="text-yellow-400 ml-1.5">({user.loyaltyPoints.toFixed(0)} pts)</span>
                    )}
                  </p>
                </div>


                <button
                  onClick={handleLogout}
                  className="bg-emerald-950/40 hover:bg-red-950/30 hover:text-red-300 text-gray-400 border border-emerald-900/20 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs shadow-lg shadow-yellow-500/10 hover:shadow-yellow-400/20 active:scale-95 transition-all uppercase tracking-wider"
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
