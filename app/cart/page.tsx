'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useCart, useAuth } from '../providers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { 
    cart, updateQuantity, removeFromCart, 
    subtotal, discount, promoCode, applyPromo, removePromo,
    shippingType, setShippingType, shippingCost,
    redeemedPoints, setRedeemedPoints, total, clearCart
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [pointsInput, setPointsInput] = useState(0);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    setPromoFeedback(null);
    const result = await applyPromo(promoInput);
    setPromoFeedback(result);
    if (result.success) {
      setPromoInput('');
    }
  };

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const maxRedeemablePoints = Math.min(user.loyaltyPoints, (subtotal - discount) / 0.1);
    const pts = Math.min(maxRedeemablePoints, Math.max(0, pointsInput));
    setRedeemedPoints(pts);
  };

  const freeShippingThreshold = 50.00;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="text-5xl mb-6 block">🛒</span>
          <h2 className="text-2xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            Looks like you haven't added any premium wellness products yet.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
          >
            Go Shop Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          Shopping <span className="text-yellow-400">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Free Shipping Alert Bar */}
            <div className="bg-emerald-950/25 border border-emerald-900/40 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-300 mb-2">
                {subtotal >= freeShippingThreshold ? (
                  <span>🎉 Standard shipping is FREE!</span>
                ) : (
                  <span>
                    Add <span className="text-yellow-400 font-bold">${remainingForFreeShipping.toFixed(2)}</span> more for FREE shipping
                  </span>
                )}
                <span>Subtotal: ${subtotal.toFixed(2)} / ${freeShippingThreshold.toFixed(2)}</span>
              </div>
              <div className="w-full bg-[#050e0a] h-2.5 rounded-full overflow-hidden border border-emerald-950">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${freeShippingPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {cart.map((item) => {
                const finalProductPrice = item.product.price * (1 - (item.product.discountPercent || 0) / 100);
                const rowTotal = finalProductPrice * item.quantity;

                return (
                  <div 
                    key={item.product._id} 
                    className="bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl bg-emerald-950 border border-emerald-900/50 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm hover:text-yellow-400">
                          <Link href={`/product/${item.product._id}`}>{item.product.name}</Link>
                        </h4>
                        <p className="text-[11px] text-emerald-400">{item.product.category}</p>
                        <p className="text-xs text-gray-400 mt-1">${finalProductPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Quantity Controls & Deletion */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-emerald-900/40 bg-[#050e0a] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-emerald-950 text-gray-400 font-bold transition-colors cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold w-10 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-emerald-950 text-gray-400 font-bold transition-colors cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white text-sm">${rowTotal.toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline mt-1 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="bg-emerald-950/30 hover:bg-red-950/20 hover:text-red-300 border border-emerald-900/40 text-gray-400 px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Clear Entire Cart
              </button>
            </div>

          </div>

          {/* Right Column: Order Summary & Checkout Parameters */}
          <div className="space-y-6">
            
            {/* Summary card */}
            <div className="bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-emerald-900/30 pb-3 flex items-center gap-2">
                <span>📋</span> Order Summary
              </h3>

              <div className="space-y-3.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-yellow-400 font-medium">
                    <span>Coupon Discount ({promoCode})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                {redeemedPoints > 0 && (
                  <div className="flex justify-between text-yellow-400 font-medium">
                    <span>Points Redeemed ({redeemedPoints} pts)</span>
                    <span>-${(redeemedPoints * 0.10).toFixed(2)}</span>
                  </div>
                )}

                {/* Shipping Selector */}
                <div className="pt-2 border-t border-emerald-900/20 space-y-2">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Select Shipping Method
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShippingType('standard')}
                      className={`py-2 px-3 border rounded-xl text-[11px] font-semibold text-center transition-all ${
                        shippingType === 'standard'
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                      }`}
                    >
                      Standard Shipping ({shippingCost === 0 && shippingType === 'standard' ? 'FREE' : '$5.00'})
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingType('express')}
                      className={`py-2 px-3 border rounded-xl text-[11px] font-semibold text-center transition-all ${
                        shippingType === 'express'
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'bg-[#050e0a]/50 text-gray-300 border-emerald-900/40 hover:bg-emerald-950/50'
                      }`}
                    >
                      Express Delivery ($10.00)
                    </button>
                  </div>
                  <span className="block text-[9px] text-gray-500 leading-tight">
                    * Standard Shipping: 3-5 business days. Express Delivery: 1-2 business days.
                  </span>
                </div>

                <div className="flex justify-between pt-4 border-t border-emerald-900/20 text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="text-yellow-400 text-base font-black">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-4 border-t border-emerald-900/20">
                {promoCode ? (
                  <div className="flex justify-between items-center bg-[#050e0a]/60 border border-emerald-900/40 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-yellow-400 font-bold">{promoCode}</span>
                      <span className="text-emerald-500 font-medium ml-1">Applied</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="WELCOME15"
                      className="flex-grow bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:border-yellow-500 focus:outline-none text-white uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 px-4 py-2 border border-emerald-900/40 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoFeedback && (
                  <p className={`text-[10px] mt-1.5 font-medium ${promoFeedback.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {promoFeedback.message}
                  </p>
                )}
                <span className="block text-[9px] text-gray-500 mt-1 leading-tight">
                  * Try promo code: <span className="font-bold text-gray-400">WELCOME15</span> for 15% off, or <span className="font-bold text-gray-400">NEXO10</span> for 10% off.
                </span>
              </div>

              {/* Loyalty Points Redemption Input (Only if user has points) */}
              {user && user.loyaltyPoints > 0 && (
                <div className="pt-4 border-t border-emerald-900/20 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Redeem Loyalty Points
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    You have <span className="text-yellow-400 font-bold">{user.loyaltyPoints.toFixed(2)}</span> points. 
                    Redeeming reduces order cost (1 point = $0.10).
                  </p>
                  <form onSubmit={handleRedeemPoints} className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={user.loyaltyPoints}
                      step="0.5"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(Number(e.target.value))}
                      placeholder="Points quantity"
                      className="flex-grow bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3 py-2 text-xs focus:border-yellow-500 focus:outline-none text-white"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 px-4 py-2 border border-emerald-900/40 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Redeem
                    </button>
                  </form>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all text-xs cursor-pointer block text-center"
              >
                Proceed to Checkout 🔒
              </button>

            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda India. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
