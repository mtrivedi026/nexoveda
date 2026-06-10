'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart, useAuth } from '../providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Seed Global Regions & States for Autocomplete
const GLOBAL_REGIONS = [
  { city: 'New York', state: 'New York, USA', code: '10001' },
  { city: 'London', state: 'Greater London, UK', code: 'EC1A 1BB' },
  { city: 'Dubai', state: 'Dubai, UAE', code: '00000' },
  { city: 'Singapore', state: 'Singapore', code: '018981' },
  { city: 'Sydney', state: 'New South Wales, Australia', code: '2000' },
  { city: 'Tokyo', state: 'Tokyo, Japan', code: '100-0001' },
  { city: 'Toronto', state: 'Ontario, Canada', code: 'M5H 2N2' },
  { city: 'Paris', state: 'Île-de-France, France', code: '75001' },
  { city: 'Berlin', state: 'Berlin, Germany', code: '10115' },
  { city: 'Mumbai', state: 'Maharashtra, India', code: '400001' },
  { city: 'Delhi', state: 'Delhi, India', code: '110001' }
];

export default function CheckoutPage() {
  const { cart, subtotal, discount, shippingCost, total, redeemedPoints, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [postcode, setPostcode] = useState('');

  // Autocomplete UI states
  const [citySuggestions, setCitySuggestions] = useState<typeof GLOBAL_REGIONS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Status states
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Auto-scroll to validation error when it occurs
  useEffect(() => {
    if (validationError) {
      const errorBox = document.getElementById('validation-error-box');
      if (errorBox) {
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [validationError]);

  // Handle city input autocomplete
  const handleCityChange = (val: string) => {
    setCityInput(val);
    if (val.trim().length > 0) {
      const filtered = GLOBAL_REGIONS.filter(r => 
        r.city.toLowerCase().startsWith(val.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (region: typeof GLOBAL_REGIONS[0]) => {
    setCityInput(region.city);
    setGovernorate(region.state);
    setPostcode(region.code);
    setShowSuggestions(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Clean/sanitize phone input (remove spaces, dashes, parentheses)
    let cleanPhone = phone.trim().replace(/[\s\-()]/g, '');

    // Validations
    if (!name || !email || !cleanPhone || !addressLine1 || !cityInput || !postcode) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    // Global Phone Validation: standard E.164 pattern (+ followed by 7 to 15 digits, or just 7 to 15 digits)
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setValidationError('Please enter a valid global phone number with country code (e.g., +15550199 or +919876543210).');
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: name,
      customerEmail: email,
      customerPhone: cleanPhone,
      addressLine1,
      suburb: cityInput,
      state: governorate || 'Global',
      postcode,
      items: cart.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price * (1 - (item.product.discountPercent || 0) / 100)
      })),
      subtotal,
      shippingCost,
      total,
      redeemedPoints,
      customerId: user ? user.id : null
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit order.');
      }
      setSuccessOrder(data);
      clearCart();
    } catch (err: any) {
      setValidationError(err.message || 'Connection error placing order.');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="max-w-xl w-full bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
            <span className="text-6xl block animate-pulse">📦</span>
            <h2 className="text-3xl font-black text-white">Order Placed Successfully!</h2>
            
            <div className="bg-[#050e0a]/60 border border-emerald-900/30 rounded-2xl p-5 space-y-2 text-left text-xs text-gray-300">
              <p><span className="text-emerald-400 font-bold">Order ID:</span> {successOrder._id}</p>
              <p><span className="text-emerald-400 font-bold">Recipient:</span> {successOrder.customerName}</p>
              <p><span className="text-emerald-400 font-bold">Delivery:</span> {successOrder.addressLine1}, {successOrder.suburb}, {successOrder.state}</p>
              <p><span className="text-emerald-400 font-bold">Grand Total:</span> ${successOrder.total.toFixed(2)}</p>
              <p><span className="text-emerald-400 font-bold">Shipment Status:</span> <span className="bg-yellow-500/25 text-yellow-400 font-bold px-2 py-0.5 rounded border border-yellow-500/40 uppercase text-[10px]">Pending</span></p>
            </div>

            <p className="text-sm text-emerald-300 max-w-sm mx-auto leading-relaxed">
              Thank you for trusting Nexoveda! Your package will be prepared and shipped shortly. 
              {user 
                ? ' You can track the shipment status in your dashboard.' 
                : ' Create a customer account using this email to track order history.'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 px-6 py-3 border border-emerald-900/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Back to Shop
              </button>
            </div>
          </div>
        </main>
        <footer className="py-6 border-t border-emerald-950/40 text-center text-xs text-emerald-600">
          © 2026 Nexoveda Global. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          Secure <span className="text-yellow-400">Checkout</span>
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">Your cart is empty. Please add items before checkout.</p>
            <Link href="/shop" className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left: Checkout Shipping Details Form */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
              
              {validationError && (
                <div id="validation-error-box" className="bg-red-950/30 border border-red-900/50 text-red-200 px-4 py-3.5 rounded-xl text-xs flex gap-2 items-center scroll-mt-24">
                  <span className="text-lg">⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. Contact Information */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-emerald-400">📞</span> Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
 
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Phone Number (include country code, e.g. +15550199) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+15550199"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-emerald-400">📍</span> Delivery Address
                </h3>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Street Address / Villa & Way Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Villa 14, Way 2831"
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                      City / Suburb *
                    </label>
                    <input
                      type="text"
                      required
                      value={cityInput}
                      onChange={(e) => handleCityChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="e.g. London, New York"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                    {showSuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1.5 bg-emerald-950 border border-emerald-900 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                        {citySuggestions.map((region, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectCity(region)}
                            className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-yellow-500 hover:text-black font-semibold transition-colors"
                          >
                            {region.city} ({region.state})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
 
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                      State / Province / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      placeholder="e.g. New York"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                  </div>
 
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                      Postal Code / Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="e.g. 10001"
                      className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-4 py-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                </div>
              </div>
            </div>

              {/* 3. Payment Method Simulation */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-emerald-400">💳</span> Payment Information
                </h3>
                <div className="bg-[#050e0a]/80 border border-emerald-900/40 p-4 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-300">Cash on Delivery (COD) / Mobile Bank Transfer</p>
                    <p className="text-gray-400 mt-0.5">Pay safely in USD ($) once your package arrives at your doorstep or via bank transfer.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-4 rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/10 hover:shadow-yellow-400/20 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Order...' : `Place Cash on Delivery Order ($${total.toFixed(2)}) 🔒`}
              </button>

            </form>

            {/* Right: Order summary card */}
            <aside className="lg:col-span-1 bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-emerald-900/30 pb-3">
                Items Summary
              </h3>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => {
                  const finalProductPrice = item.product.price * (1 - (item.product.discountPercent || 0) / 100);
                  return (
                    <div key={item.product._id} className="flex gap-3 justify-between items-center text-xs">
                      <div className="flex gap-2.5 items-center">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-emerald-950 border border-emerald-900/40"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-gray-400 text-[10px]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-emerald-300">${(finalProductPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-emerald-900/20 space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                {redeemedPoints > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Points Discount</span>
                    <span>-${(redeemedPoints * 0.10).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="text-white font-medium">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-emerald-900/20 text-sm font-bold text-white">
                  <span>Total Due</span>
                  <span className="text-yellow-400 font-extrabold text-base">${total.toFixed(2)}</span>
                </div>
              </div>

            </aside>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Standardized Natural Formulations. All rights reserved.
      </footer>

      {/* Floating validation error toast */}
      {validationError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-950 border border-red-800 text-red-200 px-6 py-4 rounded-2xl font-bold shadow-2xl max-w-sm flex items-center gap-3 animate-bounce">
          <span className="text-lg">⚠️</span>
          <div className="text-xs">
            <p className="font-extrabold uppercase tracking-wide text-red-400">Checkout Warning</p>
            <p className="text-gray-100 font-medium mt-0.5">{validationError}</p>
          </div>
          <button 
            type="button"
            onClick={() => setValidationError('')} 
            className="text-white hover:text-red-200 ml-auto font-black text-xs cursor-pointer bg-red-900 hover:bg-red-800 w-5 h-5 rounded-full flex items-center justify-center border-0"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
