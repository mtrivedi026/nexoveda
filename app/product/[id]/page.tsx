'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useCart } from '../../providers';

interface Review {
  author: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  discountPercent: number;
  suggestedUse?: string;
  sku?: string;
  ingredients: string[];
  benefits: string[];
  reviews: Review[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [cartFeedback, setCartFeedback] = useState(false);

  // Review form states
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadProduct = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p._id === id);
        if (found) {
          setProduct(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading product details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setCartFeedback(true);
    setTimeout(() => setCartFeedback(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text) {
      setReviewError('Please specify your name and review content.');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          location: location || 'Global',
          rating,
          text
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit review.');
      }

      setReviewSuccess(true);
      setAuthor('');
      setLocation('');
      setRating(5);
      setText('');
      loadProduct(); // Reload reviews and stars
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-emerald-400 font-medium text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="text-4xl mb-4 block">🍃</span>
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6 max-w-sm">
            This product doesn't exist in our catalog or may have been discontinued.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-sm"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col">
      <Navbar />

      {/* Cart Feedback Toast */}
      {cartFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black px-6 py-3.5 rounded-xl font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <span>🛒</span>
          <span>Added {qty} {product.name} to cart!</span>
        </div>
      )}

      {/* Main product display */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Product Image */}
          <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl overflow-hidden shadow-xl max-w-lg mx-auto w-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>

          {/* Right Column: Product details */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-emerald-800/80 bg-emerald-950/50 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span>🍃</span> {product.category}
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 text-sm text-yellow-400 font-bold">
              <span className="text-lg">⭐</span>
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({product.reviewCount} verified customer reviews)</span>
            </div>

            {/* Pricing Section */}
            <div className="bg-emerald-950/20 border border-emerald-900/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-400 font-semibold mb-1">Price</p>
                {product.discountPercent > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">${discountedPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-white">${product.price.toFixed(2)}</span>
                )}
              </div>

              {product.discountPercent > 0 && (
                <span className="bg-yellow-500 text-black text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg shadow-yellow-500/10">
                  Save {product.discountPercent}% Today
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Ingredients Check list */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Ingredients (Standardized):</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, i) => (
                    <span key={i} className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-medium">
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits Checklist */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Key Health Benefits:</h3>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {product.benefits.map((ben, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-yellow-400">⚡</span>
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Use */}
            {product.suggestedUse && (
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl text-xs text-gray-300">
                <p className="font-bold text-emerald-400 mb-1">Suggested Use:</p>
                <p>{product.suggestedUse}</p>
              </div>
            )}

            {/* Qty & Add cart action */}
            <div className="flex gap-4 items-center pt-4 border-t border-emerald-900/20">
              <div className="flex items-center border border-emerald-900/40 bg-[#050e0a] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2.5 hover:bg-emerald-950 text-gray-400 font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold w-12 text-center text-white">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-2.5 hover:bg-emerald-950 text-gray-400 font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-grow bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer"
              >
                Add {qty} Item(s) to Cart 🛒
              </button>
            </div>
            
            <p className="text-[10px] text-gray-500">
              * SKU: {product.sku || 'NEX-GEN-000'} | Stock is available in global warehouses.
            </p>
          </div>

        </div>

        {/* Reviews Section */}
        <div className="mt-20 pt-10 border-t border-emerald-900/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Verified Reviews ({product.reviews ? product.reviews.length : 0})
              </h2>

              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews submitted yet for this product. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((rev, i) => (
                    <div key={i} className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-5 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-white">{rev.author}</p>
                          <p className="text-[10px] text-emerald-500 font-semibold">{rev.location}</p>
                        </div>
                        <span className="text-[10px] text-gray-500">{rev.date}</span>
                      </div>
                      
                      <div className="text-yellow-400 text-xs flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <span key={starIndex}>{starIndex < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed">
                        {rev.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Review Form */}
            <div className="lg:col-span-1 bg-emerald-950/15 border border-emerald-900/30 rounded-3xl p-6 h-fit backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-900/30 pb-3">
                Write a Review
              </h3>

              {reviewSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs mb-4">
                  ✓ Review submitted and average rating updated!
                </div>
              )}

              {reviewError && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-200 px-4 py-3 rounded-xl text-xs mb-4">
                  ⚠️ {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Your Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
                  />
                </div>
 
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="London, UK"
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Product Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Poor)</option>
                    <option value={1}>1 Star (Awful)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full bg-[#050e0a]/80 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs focus:border-yellow-500 focus:outline-none transition-colors text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-yellow-500 text-black font-bold py-2.5 rounded-xl hover:bg-yellow-400 active:scale-98 transition-all text-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/20 border-t border-emerald-900/30 py-8 text-center text-xs text-emerald-600 mt-12">
        © 2026 Nexoveda Global. Standardized Natural Formulations. All rights reserved.
      </footer>
    </div>
  );
}
