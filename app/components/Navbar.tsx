'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, useCart, useChat } from '../providers';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { setChatOpen, setChatTab } = useChat();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAssessOpen, setIsMobileAssessOpen] = useState(false);
  const [isDesktopAssessOpen, setIsDesktopAssessOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isStaff = user && (user.role === 'agent' || user.role === 'admin');

  const handleLogout = () => {
    logout();
    if (isStaff) {
      window.location.href = '/staff';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#030906]/70 border-b border-emerald-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-22">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300">🌿</span>
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-tight">Nexoveda</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-black uppercase tracking-wider text-emerald-100/75">
            <Link href="/" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">Home</Link>
            <Link href="/about" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">Information About Nexoveda</Link>
            <Link href="/about" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">About Us</Link>
            <Link href="/shop" className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">Shop Catalog</Link>
            
            {!isStaff && (
              <button 
                onClick={() => { setChatTab('chat'); setChatOpen(true); }} 
                className="hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer text-xs font-black uppercase tracking-wider text-emerald-100/75 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Talk to Health Consultant
              </button>
            )}

            <Link href={user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/staff' : '/dashboard'} className="hover:text-yellow-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-yellow-400 hover:after:w-full after:transition-all after:duration-300">
              {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'agent' ? 'Staff Portal' : 'My Dashboard'}
            </Link>
            
            {/* Self Assessment Dropdown */}
            {!isStaff && (
              <div className="relative">
                <button 
                  onClick={() => setIsDesktopAssessOpen(!isDesktopAssessOpen)}
                  className={`flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer text-xs font-black uppercase tracking-wider text-emerald-100/75 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-yellow-400 after:transition-all after:duration-300 ${isDesktopAssessOpen ? 'text-yellow-400 after:w-full' : 'hover:text-yellow-400 after:w-0 hover:after:w-full'}`}
                >
                  Self Assessment <span className="text-[10px]">{isDesktopAssessOpen ? '▲' : '▼'}</span>
                </button>
                
                {isDesktopAssessOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDesktopAssessOpen(false)}></div>
                    <div className="absolute left-0 mt-2 w-56 bg-emerald-950 border border-emerald-800 rounded-xl shadow-2xl py-2 z-50 transition-all duration-200">
                      <a 
                        href="https://forms.gle/kZmivGCmd3uuRwjM7" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => setIsDesktopAssessOpen(false)}
                        className="block px-4.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 hover:bg-yellow-500 hover:text-black transition-colors"
                      >
                        Male Assessment Form 1
                      </a>
                      <a 
                        href="https://forms.gle/GJNfVwA6ifcZXHMHA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => setIsDesktopAssessOpen(false)}
                        className="block px-4.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 hover:bg-yellow-500 hover:text-black transition-colors border-t border-emerald-900/50"
                      >
                        Male Assessment Form 2
                      </a>
                      <a 
                        href="https://forms.gle/ytpTbaaPY7ecchVBA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => setIsDesktopAssessOpen(false)}
                        className="block px-4.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 hover:bg-yellow-500 hover:text-black transition-colors border-t border-emerald-900/50"
                      >
                        Female Assessment Form
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Cart Link */}
            {!isStaff && (
              <Link href="/cart" className="relative p-2.5 sm:p-3 text-emerald-300 hover:text-yellow-400 transition-all bg-emerald-950/15 rounded-2xl border border-emerald-900/15 hover:border-yellow-400/40">
                <span className="text-lg sm:text-xl">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[9px] sm:text-[10px] font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border border-[#030906]">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden lg:block text-right">
                  <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">Logged In</p>
                  <p className="text-xs font-black text-emerald-300 mt-0.5">
                    {user.name.split(' ')[0]} 
                    {user.role === 'customer' ? (
                      user.loyaltyPoints !== undefined && (
                        <span className="text-yellow-400 ml-1.5">({(user.loyaltyPoints || 0).toFixed(0)} pts)</span>
                      )
                    ) : (
                      <span className="text-yellow-400 ml-1.5 uppercase text-[9px] border border-yellow-400/40 px-1 py-0.5 rounded ml-2">
                        {user.role}
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-emerald-950/40 hover:bg-red-950/30 hover:text-red-300 text-gray-400 border border-emerald-900/20 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs shadow-lg shadow-yellow-500/10 hover:shadow-yellow-400/20 active:scale-95 transition-all uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-emerald-400 hover:text-yellow-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-950/30 bg-[#030906]/95 backdrop-blur-xl px-4 py-6 shadow-2xl">
          <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-wider text-emerald-100/80">
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="hover:text-yellow-400 py-2 border-b border-emerald-900/20">Home</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/about" className="hover:text-yellow-400 py-2 border-b border-emerald-900/20">Information About Nexoveda</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/about" className="hover:text-yellow-400 py-2 border-b border-emerald-900/20">About Us</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/shop" className="hover:text-yellow-400 py-2 border-b border-emerald-900/20">Shop Catalog</Link>
            
            {!isStaff && (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setChatTab('chat'); setChatOpen(true); }} 
                className="hover:text-yellow-400 text-left py-2 border-b border-emerald-900/20 bg-transparent border-none cursor-pointer uppercase font-black"
              >
                Talk to Health Consultant
              </button>
            )}

            <Link onClick={() => setIsMobileMenuOpen(false)} href={user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/staff' : '/dashboard'} className="hover:text-yellow-400 py-2 border-b border-emerald-900/20">
              {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'agent' ? 'Staff Portal' : 'My Dashboard'}
            </Link>
            
            {/* Mobile Self Assessment Accordion */}
            {!isStaff && (
              <div>
                <button 
                  onClick={() => setIsMobileAssessOpen(!isMobileAssessOpen)}
                  className="w-full flex justify-between items-center py-2 hover:text-yellow-400 border-b border-emerald-900/20 bg-transparent border-none cursor-pointer uppercase font-black"
                >
                Self Assessment <span>{isMobileAssessOpen ? '▲' : '▼'}</span>
              </button>
              {isMobileAssessOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-2 border-l-2 border-emerald-900/40 py-2">
                  <a 
                    href="https://forms.gle/kZmivGCmd3uuRwjM7" target="_blank" rel="noopener noreferrer"
                    className="py-1.5 text-[10px] text-emerald-300 hover:text-yellow-400"
                  >
                    Male Assessment Form 1
                  </a>
                  <a 
                    href="https://forms.gle/GJNfVwA6ifcZXHMHA" target="_blank" rel="noopener noreferrer"
                    className="py-1.5 text-[10px] text-emerald-300 hover:text-yellow-400"
                  >
                    Male Assessment Form 2
                  </a>
                  <a 
                    href="https://forms.gle/ytpTbaaPY7ecchVBA" target="_blank" rel="noopener noreferrer"
                    className="py-1.5 text-[10px] text-emerald-300 hover:text-yellow-400"
                  >
                    Female Assessment Form
                  </a>
                </div>
              )}
            </div>
            )}
            
            {/* Mobile Logged In User Info */}
            {user && (
              <div className="mt-4 pt-4 border-t border-emerald-900/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold">Logged In As</p>
                  <p className="text-sm font-black text-emerald-300">{user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold">{user.role === 'customer' ? 'Points' : 'Role'}</p>
                  <p className="text-sm font-black text-yellow-400 uppercase">
                    {user.role === 'customer' ? (user.loyaltyPoints || 0).toFixed(0) : user.role}
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </nav>
  );
}
